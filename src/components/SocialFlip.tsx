import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    FaGithub,
    FaTwitter,
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaEnvelope,
    FaDiscord,
} from "react-icons/fa";

// Data mapping for your current contact links
const items = [
    { letter: "G", icon: <FaGithub />, label: "GitHub", href: "https://github.com/fwabyss0", color: "#a855f7" },
    { letter: "L", icon: <FaLinkedin />, label: "LinkedIn", href: "https://www.linkedin.com/in/alish-shrestha-4276b8379/", color: "#38bdf8" },
    { letter: "I", icon: <FaInstagram />, label: "Instagram", href: "https://www.instagram.com/aliisshhhhhh/", color: "#f472b6" },
    { letter: "F", icon: <FaFacebook />, label: "Facebook", href: "https://www.facebook.com/alish.shrestha.138982/", color: "#60a5fa" },
    { letter: "E", icon: <FaEnvelope />, label: "Email", href: "mailto:shrestaalish444@gmail.com", color: "#4ade80" },
];

export default function SocialFlip() {
    return (
        <ul className="social contact__links" id="contactLinks" aria-label="Social links">
            {items.map((item, index) => (
                <li key={index} className="social__item">
                    <a className="social__flip" href={item.href} target="_blank" rel="noopener noreferrer" 
                       aria-label={`${item.label} (opens in a new tab)`} data-tip={item.label} data-letter={item.letter}
                       style={{ '--sc': item.color } as React.CSSProperties}>
                        <span className="social__inner">
                            <span className="social__face social__face--front" aria-hidden="true">{item.letter}</span>
                            <span className="social__face social__face--back" aria-hidden="true">{item.icon}</span>
                        </span>
                        <span className="social__tip" aria-hidden="true">{item.label}</span>
                    </a>
                </li>
            ))}
        </ul>
    );
}
