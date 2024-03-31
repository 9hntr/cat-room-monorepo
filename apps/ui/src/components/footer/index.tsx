import React from "react";

const Footer: React.FC<any> = () => {
  return (
    <div
      className="text-white text-center font-semibold select-none text-sm z-100"
      id="footer"
    >
      <a
        href="https://github.com/sorrowintogold/cat-room-monorepo"
        target="_blank"
        className="text-white ml-1"
      >
        Go to source code
      </a>
    </div>
  );
};

export default Footer;
