export default function CardWithImage({title,src,reason}) {
    return <div className="card-with-image">
        <img src={src} alt="" />
        <h2>{title}</h2>
        <p>{reason}</p>
    </div>
}