export default function useAssets() {
  const allSvgs = import.meta.globEager("/src/assets/images/*.svg");
  return {
    loadingSpinnerSvg:
      allSvgs["/src/assets/images/loading_spinner.svg"].default,
    deleteSvg: allSvgs["/src/assets/images/remove_circle.svg"].default,
    addSvg: allSvgs["/src/assets/images/add_circle.svg"].default,
  };
}
