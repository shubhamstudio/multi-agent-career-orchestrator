export const BrandMark = ({ className = "h-7 w-7" }) => (
  <span className={`block shrink-0 overflow-hidden rounded-md ${className}`} aria-hidden="true">
    <img
      src="/logo.png"
      alt=""
      className="h-full w-full object-cover"
    />
  </span>
)

const Brand = ({ className = "", markClassName = "h-7 w-7" }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <BrandMark className={markClassName} />
    <span>GLANGEN</span>
  </span>
)

export default Brand
