import logoImg from "/logo1.png";
export default function Footer() {
  return (
    <>
      <footer>
        <div className="container footer-container">
          <div className="col-3">
            <img src={logoImg} alt="logo" />
            <br />
            <div className="social">
              <a href="https://www.facebook.com">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://www.twitter.com">
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a href="https://www.linkedin.com">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <br />
            <span className="address">Pouzdan partner</span>
          </div>
          <div className="col-3">
            <h6>O nama</h6>
            <p>
              Naša misija je da najam automobila učinimo jednostavnim, brzim i
              praktičnim nudeći fleksibilne opcije rezervacije, konkurentne
              cijene i izuzetnu uslugu.
            </p>
          </div>
          <div className="col-3">
            <h6>Radni časovi</h6>
            <p>Radnim danima,Subotom: 7-24h</p>
            <p>Nedeljom: 9-17h</p>
          </div>
          <div className="col-3">
            <h6>Kontakt</h6>
            <p>
              E-mail:<a href="mailto:mailme@gmail.com">rentora@gmail.com</a>
            </p>
            <p>
              Telefon: <a href="tel:713-298">713-298</a>
            </p>
          </div>
        </div>
        <div className="copyright">
          Copyright &#169; 2024 | Rentora All rights reserved
        </div>
      </footer>
    </>
  );
}
