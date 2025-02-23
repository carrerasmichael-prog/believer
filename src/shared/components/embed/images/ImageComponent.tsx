import {useState, MouseEvent} from "react"
import ProxyImg from "../../ProxyImg"
import classNames from "classnames"

interface ImageComponentProps {
  match: string
  index: number
  onClickImage: () => void
  blur?: boolean
}

const ImageComponent = ({match, index, onClickImage, blur}: ImageComponentProps) => {
  const [hasError, setHasError] = useState(false)

  const onClick = (event: MouseEvent) => {
    event.stopPropagation()
    onClickImage()
  }

  return (
    <div
      key={match + index}
      className="flex justify-center items-center md:justify-start my-2"
    >
      {hasError ? (
        <div className="my-2 text-sm break-all">{match}</div>
      ) : (
        <ProxyImg
          width={600}
          onError={() => setHasError(true)}
          onClick={onClick}
          className={classNames("my-2 max-h-[90vh] max-w-full cursor-pointer", {
            "blur-md": blur,
          })}
          src={match}
        />
      )}
    </div>
  )
}

export default ImageComponent
