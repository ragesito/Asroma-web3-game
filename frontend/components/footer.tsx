import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white/70 mt-1 ">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm">
          &copy; {currentYear} Asroma. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
