export default function DinamicCard({number,title,img}){
    return <div className="dinamic-card">
        <h1>{title}</h1>
        <h1>{number}</h1>
    </div>
}