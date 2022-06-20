export default function useAssets() {
  const allSvgs = import.meta.globEager("/src/assets/images/*.svg");
  const allPngs = import.meta.globEager("/src/assets/images/*.png");
  return {
    loadingSpinnerSvg:
      allSvgs["/src/assets/images/loading_spinner.svg"].default,
    deleteSvg: allSvgs["/src/assets/images/remove_circle.svg"].default,
    addSvg: allSvgs["/src/assets/images/add_circle.svg"].default,
    AFLogoSvg: allPngs["/src/assets/images/AF_favicon.png"].default,
    warningSvg: allSvgs["/src/assets/images/warning.svg"].default,
  };
}
