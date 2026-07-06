import React from 'react';
import aiChefLogo from "./images/ai-chef.png"

export default function Header() {
    return (
        <header>
            <img src={aiChefLogo}/>
            <h1>AI Chef</h1>
        </header>
    )
}
