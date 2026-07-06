<?php

namespace AiChef\Services;

use RuntimeException;

class EmailService
{
    public function __construct(
        private string $enabled,
        private string $to,
        private string $from,
        private string $driver,
        private string $smtpHost,
        private string $smtpPort,
        private string $smtpUsername,
        private string $smtpPassword,
        private JsonFileStorage $outboxStorage
    ) {
    }

    public function settings(): array
    {
        return [
            'enabled' => strtolower($this->enabled) === 'true',
            'recipient' => trim($this->to),
        ];
    }

    public function sendShoppingList(array $items, string $recipient = ''): void
    {
        if (strtolower($this->enabled) !== 'true') {
            throw new RuntimeException('Email sending is not configured.');
        }

        $to = trim($recipient) ?: trim($this->to);

        if ($to === '' || trim($this->from) === '') {
            throw new RuntimeException('Email recipient or sender is missing.');
        }

        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Enter a valid recipient email address.');
        }

        if (count($items) === 0) {
            throw new RuntimeException('Shopping list is empty.');
        }

        $body = "Shopping list:\n\n" . implode("\n", array_map(
            fn ($item) => '- ' . (string) ($item['name'] ?? ''),
            $items
        ));

        $subject = 'AI Chef shopping list';
        $driver = strtolower($this->driver ?: 'json');

        if ($driver === 'smtp') {
            $this->sendSmtp($to, $subject, $body);

            return;
        }

        if ($driver !== 'mail') {
            $outbox = $this->outboxStorage->all();
            $outbox[] = [
                'to' => $to,
                'from' => $this->from,
                'subject' => $subject,
                'body' => $body,
                'createdAt' => gmdate('c'),
            ];
            $this->outboxStorage->saveAll($outbox);

            return;
        }

        $headers = implode("\r\n", [
            'From: ' . $this->from,
            'Reply-To: ' . $this->from,
            'Content-Type: text/plain; charset=UTF-8',
        ]);

        if (!mail($to, $subject, $body, $headers)) {
            throw new RuntimeException('Email could not be sent by the server mail configuration.');
        }
    }

    private function sendSmtp(string $to, string $subject, string $body): void
    {
        $host = trim($this->smtpHost);
        $port = (int) ($this->smtpPort ?: 587);
        $username = trim($this->smtpUsername);
        $password = trim($this->smtpPassword);

        if ($host === '' || $username === '' || $password === '') {
            throw new RuntimeException('SMTP host, username, or password is missing.');
        }

        $socket = @stream_socket_client(
            'tcp://' . $host . ':' . $port,
            $errorCode,
            $errorMessage,
            20,
            STREAM_CLIENT_CONNECT
        );

        if (!$socket) {
            throw new RuntimeException('SMTP connection failed: ' . ($errorMessage ?: 'unknown error'));
        }

        stream_set_timeout($socket, 20);

        try {
            $this->smtpExpect($socket, [220]);
            $this->smtpCommand($socket, 'EHLO localhost', [250]);
            $this->smtpCommand($socket, 'STARTTLS', [220]);

            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('SMTP TLS handshake failed.');
            }

            $this->smtpCommand($socket, 'EHLO localhost', [250]);
            $this->smtpCommand($socket, 'AUTH LOGIN', [334]);
            $this->smtpCommand($socket, base64_encode($username), [334]);
            $this->smtpCommand($socket, base64_encode($password), [235]);
            $this->smtpCommand($socket, 'MAIL FROM:<' . $this->from . '>', [250]);
            $this->smtpCommand($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
            $this->smtpCommand($socket, 'DATA', [354]);

            $message = implode("\r\n", [
                'From: ' . $this->from,
                'To: ' . $to,
                'Subject: ' . $subject,
                'MIME-Version: 1.0',
                'Content-Type: text/plain; charset=UTF-8',
                '',
                str_replace(["\r\n.", "\n."], ["\r\n..", "\n.."], $body),
                '.',
            ]);

            $this->smtpCommand($socket, $message, [250]);
            $this->smtpCommand($socket, 'QUIT', [221]);
        } finally {
            fclose($socket);
        }
    }

    private function smtpCommand(mixed $socket, string $command, array $expectedCodes): string
    {
        fwrite($socket, $command . "\r\n");

        return $this->smtpExpect($socket, $expectedCodes);
    }

    private function smtpExpect(mixed $socket, array $expectedCodes): string
    {
        $response = '';

        do {
            $line = fgets($socket, 515);

            if ($line === false) {
                throw new RuntimeException('SMTP server stopped responding.');
            }

            $response .= $line;
            $code = (int) substr($line, 0, 3);
            $hasMoreLines = isset($line[3]) && $line[3] === '-';
        } while ($hasMoreLines);

        if (!in_array($code, $expectedCodes, true)) {
            throw new RuntimeException('SMTP error: ' . trim($response));
        }

        return $response;
    }
}
