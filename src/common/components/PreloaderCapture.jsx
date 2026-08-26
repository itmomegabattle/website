import MovingHeadScene from "./MovingHeadScene";

export default function PreloaderCapture({ onReady }) {
  return (
    <>
      <MovingHeadScene onReady={onReady} />
      <div className="site-preloader__spot" aria-hidden="true" />
      <div className="site-preloader__wash" aria-hidden="true" />
      <div className="site-preloader__content">
        <div className="site-preloader__logo-wrap" aria-hidden="true">
          <img className="site-preloader__logo" src="/logo.svg" width="109" height="67" alt="" />
        </div>
        <span className="site-preloader__sr">ITMO MEGABATTLE</span>
      </div>
    </>
  );
}
