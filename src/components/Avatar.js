import { initials } from "@/lib/utils";
import { AVATAR_COLORS, AVATAR_ICONS, isHexColor, isDefaultPhoto } from "@/lib/avatar";
import { LogoMark } from "./Logo";

// The one avatar used everywhere: feed, comments, profiles, cards.
// - admin: the official Buncho "b" mark.
// - a real uploaded photo (unless the person picked a drawn avatar).
// - otherwise a rounded square in the person's chosen color, with their letters or a small icon.
// Colors come from theme variables, so they change with the light/dark toggle.
export default function Avatar({ name, src, size = 48, color, icon, admin = false }) {
  if (admin) return <LogoMark size={size} />;

  const style = { width: size, height: size };
  const hasPhoto = !!src && !isDefaultPhoto(src);
  const wantsPhoto = !icon || icon === "photo";

  if (hasPhoto && wantsPhoto) {
    return <img src={src} alt="" style={style} className="shrink-0 rounded-[28%] border border-line object-cover" />;
  }

  // A named color, or a custom "#rrggbb" that is tinted for light and dark mode by the .av-custom CSS.
  const custom = isHexColor(color);
  const key = custom ? "custom" : AVATAR_COLORS.includes(color) ? color : "brand";
  const path = icon && icon !== "photo" ? AVATAR_ICONS[icon] : null;

  return (
    <span
      style={{ ...style, fontSize: size * 0.38, ...(custom ? { "--av-c": color } : null) }}
      className={`av av-${key} flex shrink-0 items-center justify-center rounded-[28%] font-display`}
      aria-hidden="true"
    >
      {path ? (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={path} />
        </svg>
      ) : (
        initials(name)
      )}
    </span>
  );
}