import React from "react";
import { siteConfig } from "../../config";

const Footer: React.FC<any> = () => {
  return (
    <footer className="text-white text-center font-semibold select-none text-sm">
      <p className="text-center text-sm leading-loose">
        Built by{" "}
        <a
          href={siteConfig.links.githubProfile}
          target="_blank"
          rel="noreferrer"
          className="font-sm underline underline-offset-4"
        >
          Carlos Barrios
        </a>
        . Source code available on{" "}
        <a
          href={siteConfig.links.sourceCode}
          target="_blank"
          rel="noreferrer"
          className="font-sm underline underline-offset-4"
        >
          GitHub
        </a>
        .
      </p>
    </footer>
  );
};

export default Footer;
