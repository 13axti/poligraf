/* Dizaynı göstərir: "shirt" — hazır t-shirt şəkli olduğu kimi; "artwork" — bizim ağ t-shirt üzərinə qoyulur */
export function DesignPreview({
  image,
  kind,
  alt,
  tee = "white",
}: {
  image: string;
  kind: "shirt" | "artwork";
  alt: string;
  tee?: "white" | "green";
}) {
  const green = tee === "green";
  return (
    <div className="relative aspect-[900/1198] w-full overflow-hidden rounded-[1.4rem] bg-[#e9e9ec]">
      {kind === "shirt" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={alt} className="h-full w-full object-contain" loading="lazy" />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={green ? "/mockups/teegreen.jpg" : "/mockups/teewhite.jpg"} alt="" className="h-full w-full object-cover" loading="lazy" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={alt}
            loading="lazy"
            className={`absolute left-1/2 -translate-x-1/2 object-contain ${green ? "top-[26%] aspect-square w-[26%]" : "top-[33%] aspect-square w-[32%] mix-blend-multiply"}`}
          />
        </>
      )}
    </div>
  );
}
