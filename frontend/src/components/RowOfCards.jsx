import CardWithImage from "./CardWithImage";
import img1 from '../assets/deadline.png'
import img2 from '../assets/fleet.png'
import img3 from '../assets/cancelled.png'
import "./RowOfCards.css";
export default function RowOfCards(){
    return <div className="row-of-card">
        <CardWithImage title="Brza i jednostavna rezervacija" src={img1} reason="Zahvaljujući intuitivnom online sistemu, vozilo možete rezervisati za nekoliko minuta."/>
        <CardWithImage title="Savremena flota" src={img2} reason="Naša vozila su nova, redovno održavana i uvek spremna za sigurno putovanje"/>
        <CardWithImage title="Besplatan otkaz rezervacije" src={img3} reason="Otkazivanje rezervacije bez dodatnih troškova do 24 sata pre preuzimanja."/>
    </div>
}