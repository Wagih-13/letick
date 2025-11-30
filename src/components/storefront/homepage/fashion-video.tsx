export function FashionVideoSection() {
  return (
    <section className=" relative h-[300px] sm:h-[300px] md:h-[300px] lg:h-[500px] " style={{ margin: "60px 0px" }}>
      <div className="w-[100vw ] absolute inset-0"
        style={{ marginInline: "calc(50% - 50vw)" }}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/Storefront/fashonVideo.mp4"
          className="h-[300px] sm:h-[300px] md:h-[300px] lg:h-[500px] w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
        />
      </div>
    </section>
  );
}
