import Header from './Header';
import Footer from './Footer';
import '../styles/Donate.css';

const Donate = () => {
  return (
    <div className="donate">
      <Header />
      <div className="donate-container">
        <div className="donate-content">
          <h1>Apoya a Oz Ragnarok</h1>
          <p>Tu donación nos ayuda a mantener y mejorar el servidor. ¡Gracias por tu apoyo!</p>
          
          <div className="benefits">
            <h2>¿Por qué donar?</h2>
            <ul>
              <li>Ayudas a mantener el servidor funcionando</li>
              <li>Apoyas el trabajo del equipo de desarrollo</li>
              <li>Contribuyes a futuras mejoras y actualizaciones</li>
              <li>Demuestras tu aprecio por el proyecto</li>
            </ul>
          </div>

          <div className="donate-form">
            <div className="payment-options">
              <div className="payment-option">
                <h3>PayPal</h3>
                <form 
                  action="https://www.paypal.com/ncp/payment/7QMHRMDP9UXPA" 
                  method="post" 
                  target="_blank"
                >
                  <input className="donate-button" type="submit" value="Donar Ahora!" />
                  <img 
                    src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" 
                    alt="Tarjetas aceptadas" 
                    className="payment-methods"
                  />
                  <div className="paypal-footer">
                    Tecnología de 
                    <img 
                      src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
                      alt="PayPal" 
                      className="paypal-logo"
                    />
                  </div>
                </form>
                <p>Realiza tu donación de forma segura con tarjeta o saldo PayPal</p>
              </div>

              <div className="payment-option">
                <h3>Nequi</h3>
                <img 
                  src="/nequi-qr.png" 
                  alt="Código QR de Nequi" 
                  className="qr-code"
                  />
                <p>Escanea el código QR para donar a través de Nequi</p>
              </div>
            </div>
          </div>

          <div className="important-notes">
            <h3>Información Importante</h3>
            <ul>
              <li>Las donaciones son completamente opcionales y voluntarias</li>
              <li>No se otorgarán ventajas ni recompensas por donar</li>
              <li>Mantenemos el balance del juego: no hay elementos pay-to-win</li>
              <li>Tu donación es una muestra de apoyo al proyecto</li>
              <li>Procesamiento seguro a través de PayPal y Nequi</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Donate; 