const Footer = () => {
  return (
    <footer className="bg-gym-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Gymnasium</h3>
            <p className="text-gray-400">
              Your trusted fitness partner for achieving your health and wellness goals.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#home" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Services</a></li>
              <li><a href="#location" className="hover:text-primary transition-colors">Location</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="https://wa.me/919970793972" className="text-gray-400 hover:text-primary transition-colors">Whatsapp</a>
              <a href="https://www.instagram.com/usgymnasium/?utm_source=qr&r=nametag" className="text-gray-400 hover:text-primary transition-colors">Instagram</a>
              {/* <a href="#" className="text-gray-400 hover:text-primary transition-colors">Twitter</a> */}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Gymnasium. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
