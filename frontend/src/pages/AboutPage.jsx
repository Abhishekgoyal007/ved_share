import React from "react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-200">
      <h1 className="text-4xl font-bold text-cyan-400 mb-6">About VedShare</h1>

      <section className="mb-8">
        <p className="text-gray-300 text-lg">
          Welcome to <strong>VedShare</strong> — a unique space where knowledge meets community. The name says it all: <em>Ved</em> means knowledge, and <em>Share</em> is exactly that — sharing what you know and have.
        </p>
        <p className="text-gray-300 text-lg mt-3">
          We’re part marketplace, part study buddy. Whether you’re looking to buy or sell secondhand textbooks or want a simple way to manage your study sessions, VedShare is built just for you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-cyan-300 mb-3">Buy & Sell Secondhand Books</h2>
        <p className="text-gray-300 mb-3">
          Textbooks can be expensive. That’s why we made it easy to resell the books you’re done with, and find affordable ones you need. It’s a win-win — save money, reduce waste, and keep the knowledge flowing.
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Browse books by category or search to find exactly what you need.</li>
          <li>List your own books for sale quickly and easily.</li>
          <li>Keep track of your listings in your personal dashboard.</li>
          <li>See featured books to catch popular or recommended picks.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-cyan-300 mb-3">Your Personal Learning Desk</h2>
        <p className="text-gray-300 mb-3">
          Studying isn’t just about books — it’s about focus and routine. That’s why VedShare has a built-in study management tool to help you stay on track.
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Use the Pomodoro timer to break your study time into focused sessions.</li>
          <li>Add multiple timers for different tasks or subjects.</li>
          <li>Pause, resume, or delete sessions whenever you want.</li>
          <li>Track your progress visually with easy-to-read progress indicators.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-cyan-300 mb-3">Account & Security</h2>
        <p className="text-gray-300 mb-3">
          Your data and privacy matter. VedShare offers secure sign-up and login with OTP verification. Forgot your password? No worries, we got you covered with a simple reset process.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-cyan-300 mb-3">Why Choose VedShare?</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Save money by buying and selling used textbooks.</li>
          <li>Manage your study time and boost productivity.</li>
          <li>Support sustainable learning — less waste, more sharing.</li>
          <li>Join a community of students helping each other succeed.</li>
        </ul>
      </section>

      <section>
  <h2 className="text-2xl font-semibold text-cyan-300 mb-3">Research & Insights</h2>
  <p className="text-gray-300 mb-3">
    At VedShare, we believe in building on solid research. We’re proud to have contributed to this growing field with our paper:
  </p>
  <ul className="list-disc list-inside space-y-2 text-blue-400 underline">
    <li>
      <a href="https://your-research-paper-link.com" target="_blank" rel="noopener noreferrer">
        <strong>"Sustainable Learning: The Role of Circular Economy in Student-Centered eCommerce"</strong>
      </a>
    </li>
  </ul>
  <p className="text-gray-300 mt-3">
    This work explores how reusing resources like textbooks not only saves money but also supports a more sustainable and collaborative learning environment. It’s the foundation for how we built VedShare — to empower students through sharing and smart study habits.
  </p>
</section>
    </div>
  );
}
