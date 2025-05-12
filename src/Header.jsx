import React from 'react';
import aiChefLogo from "./images/ai-chef.png"

export default function Header() {
    return (
        <header>
            <img src={aiChefLogo}/>
            <h1>Ai Chef</h1>
        </header>
    )
}