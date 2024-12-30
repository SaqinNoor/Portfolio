interface SocialButtonProps {
  href: string;
  text: string;
}

export default function SocialButtons() {
  const socialLinks: SocialButtonProps[] = [
    { href: 'https://facebook.com/saqin.noor', text: 'Facebook' },
    { href: 'https://discord.com/users/saqin', text: 'Discord' },
    { href: 'https://www.instagram.com/saqin.jpg/', text: 'Instagram' },
  ];

  return (
    <div className="social-buttons">
      {socialLinks.map((link) => (
        <a
          key={link.text}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-button"
          data-text={link.text}
        >
          {link.text}
        </a>
      ))}
    </div>
  );
}