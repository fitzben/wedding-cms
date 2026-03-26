export const LOGO_URL =
  "https://media.benelin.my.id/gallery/sec-logo/bc96801e-8a1f-4575-8a0e-d2049a56bf8a.png";

export default function LogoLoader({
  text,
  size = 56,
  containerClassName = "",
  textClassName = "text-gray-400 font-light italic text-sm",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${containerClassName}`}
    >
      <img
        src={LOGO_URL}
        alt=""
        draggable={false}
        style={{ width: size, height: size }}
      />
      {text ? <div className={textClassName}>{text}</div> : null}
    </div>
  );
}

