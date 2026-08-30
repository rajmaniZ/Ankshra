import { useState } from "react";
import {
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSend,
} from "react-icons/fi";
import { showError, showSuccess } from "../../utils/toast";
import styles from "./Contact.module.css";

const WHATSAPP_NUMBER = "919999999999";
const CONTACT_EMAIL = "support@prao.com";
const CONTACT_PHONE = "+91 99999 99999";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      showError("Please fill in all required fields.");
      return;
    }

    const subject =
      formData.subject.trim() || "Website Enquiry";

    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone || "Not provided"}`,
      "",
      `Message:`,
      formData.message,
    ].join("\n");

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    showSuccess("Your email request has been prepared.");

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const handleWhatsApp = () => {
    const message =
      "Hello, I would like to know more about your jewellery collection.";

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <header className={styles.heroContent}>
            <span className={styles.eyebrow}>Get In Touch</span>

            <h1 className={styles.title}>Contact Us</h1>

            <p className={styles.intro}>
              Have a question about our jewellery, an existing
              order, or need help choosing the perfect piece?
              We would love to hear from you.
            </p>
          </header>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <header className={styles.sectionHeader}>
                <span className={styles.eyebrow}>
                  Contact Information
                </span>

                <h2>We are here to help</h2>
              </header>

              <div className={styles.contactDetails}>
                <address className={styles.contactItem}>
                  <span className={styles.icon}>
                    <FiMapPin />
                  </span>

                  <div>
                    <h3>Visit Us</h3>
                    <p>
                      PRAO Fashion Jewellery
                      <br />
                      India
                    </p>
                  </div>
                </address>

                <div className={styles.contactItem}>
                  <span className={styles.icon}>
                    <FiPhone />
                  </span>

                  <div>
                    <h3>Call Us</h3>
                    <a href={`tel:${CONTACT_PHONE}`}>
                      {CONTACT_PHONE}
                    </a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <span className={styles.icon}>
                    <FiMail />
                  </span>

                  <div>
                    <h3>Email Us</h3>
                    <a href={`mailto:${CONTACT_EMAIL}`}>
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.whatsappCard}>
                <span className={styles.whatsappIcon}>
                  <FiMessageCircle />
                </span>

                <div>
                  <h3>Chat with us</h3>

                  <p>
                    For a quick response, send us a message
                    on WhatsApp.
                  </p>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className={styles.whatsappButton}
                  >
                    WhatsApp Us
                  </button>
                </div>
              </div>
            </aside>

            <section
              className={styles.formSection}
              aria-labelledby="contact-form-title"
            >
              <header className={styles.sectionHeader}>
                <span className={styles.eyebrow}>
                  Send An Enquiry
                </span>

                <h2 id="contact-form-title">
                  How can we help?
                </h2>

                <p>
                  Fill in the form and your email application
                  will open with the enquiry details.
                </p>
              </header>

              <form
                className={styles.form}
                onSubmit={handleSubmit}
              >
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label htmlFor="name">
                      Name <span>*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="email">
                      Email <span>*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label htmlFor="phone">Phone</label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="subject">Subject</label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this about?"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="message">
                    Message <span>*</span>
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message..."
                    rows="7"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  <FiSend />
                  Send Enquiry
                </button>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;