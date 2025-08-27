import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const FAQSection = () => {
  const faqData = [
    {
      question: 'What is HACKWAVE?',
      answer:
        "A 36-hour hackathon for dedicated builders and innovators. It's one part party, one part work-hard overnight battle against the clock and the competition. ",
    },
    {
      question: 'When and where is HACKWAVE 2025?',
      answer: 'August 23-25, 2025. Venue: Chameli Devi Group of institutions.',
    },
    {
      question: 'Who can participate?',
      answer:
        'Students currently enrolled in any course in College can participate in Hackwave 2.0',
    },
    {
      question: 'How do I register?',
      answer: (
        <span>
          Registration opens from 4th July 2025 to 31st July 2025 on UNSTOP.
          Follow our social media for announcements.
          <br />
          <a
            href={
              'https://unstop.com/o/szmvO5g?lb=2CqWo19U&utm_medium=Share&utm_source=shortUrl'
            }
            className="inline-block mt-2 px-6 py-2 bg-[#141414] text-[#c6fe69] rounded-md font-semibold text-base transition-colors hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-[#c6fe69] text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            Register on Unstop
          </a>
        </span>
      ),
    },
    // {
    //   question: "What are the prizes?",
    //   answer:
    //     "₹1 Lakh+ prize pool across multiple categories: Best Overall, Most Innovative, Best Technical Implementation, and Best Design.",
    // },
    {
      question: 'Can I participate as a team?',
      answer:
        'Yes, you must participate in a team of 3 to 5 members. No solos, no duos, we want that squad energy!',
    },
    {
      question: 'What technologies can I use?',
      answer:
        'Any tech stack, language, or framework. Web, mobile, AI/ML, blockchain, IoT, AR/VR - all welcome. Focus on innovation, not specific tech.',
    },
    {
      question: 'Will there be mentors?',
      answer:
        'Yes! Industry experts and technical mentors available throughout.',
    },
    {
      question: 'How many rounds are there?',
      answer: (
        <span>
          Two rounds:
          <br />
          <span role="img" aria-label="computer">
            🖥️
          </span>{' '}
          <b>Round 1 – Online Submission via Unstop:</b> Submit a PPT of a past
          project for screening.
          <br />
          <span role="img" aria-label="school">
            🏫
          </span>{' '}
          <b>Round 2 – Offline Hackathon at CDGI, Indore:</b> If selected, your
          team will build a completely new project from scratch at the venue.
          <br />
          <br />
          <span role="img" aria-label="money">
            💸
          </span>{' '}
          <b>
            Only teams selected for Round 2 will need to pay a one-time ₹500
            registration fee to confirm their spot.
          </b>{' '}
          Meals and stay are covered. Just bring your laptop{' '}
          <span role="img" aria-label="laptop">
            💻
          </span>
        </span>
      ),
    },
    {
      question: 'What do we need to submit in Round 1?',
      answer: (
        <span>
          A PPT (max 10 slides) of a previous project your team has built.
          Include:
          <br />
          <br />
          <ul className="list-disc ml-6">
            <li>Team intro</li>
            <li>Project overview</li>
            <li>Features & tech stack</li>
            <li>Screenshots or links (if any)</li>
          </ul>
          <br />
          <span role="img" aria-label="bulb">
            💡
          </span>{' '}
          <b>Note:</b> This project is for screening only and cannot be reused
          in Round 2!
        </span>
      ),
    },
    {
      question: 'Can we reuse our Round 1 project in the final hackathon?',
      answer: (
        <span>
          Nooope{' '}
          <span role="img" aria-label="angry">
            😤
          </span>{' '}
          You must build a completely new project from scratch in Round 2. The
          Round 1 project is only for evaluation.
        </span>
      ),
    },
    {
      question: 'Is there a fee to participate?',
      answer: (
        <span>
          <span role="img" aria-label="check">
            ✅
          </span>{' '}
          <b>Round 1 (Online):</b> Free
          <br />
          <span role="img" aria-label="money">
            💸
          </span>{' '}
          <b>Round 2 (Offline):</b> ₹500 per team (pay only after selection)
        </span>
      ),
    },
    {
      question: 'What happens if we’re selected for Round 2?',
      answer: (
        <span>
          Your team will be invited to the offline hackathon from 23 to 25
          August 2025 at Chameli Devi Group of Institutions, Indore. It’s a
          36-hour on-campus event where you'll build a brand new project from
          scratch based on surprise problem statements revealed at the venue. To
          confirm your spot, you’ll need to pay a ₹500 registration fee per team
          after selection.
        </span>
      ),
    },
    {
      question: 'What about the problem statements?',
      answer: (
        <span>
          Problem statements will be provided on the day of the hackathon. Each
          team can choose a problem statement from the options given and work on
          it during the event.
        </span>
      ),
    },
    {
      question: 'Is there a registration fee?',
      answer:
        'Registration is free. However, if you are selected, you will need to pay ₹500 for final confirmation.',
    },
    {
      question: 'Do I need prior coding experience?',
      answer:
        'Not necessarily. Hackathons require a mix of skills such as problem-solving, design, presentation, and development. Beginners are welcome.',
    },
    {
      question:
        'Do I need to be an expert in AI or sustainability to participate?',
      answer: "No, you don't. All you need is enthusiasm to learn and build.",
    },
    {
      question: 'What happens after Round 1 if we get selected?',
      answer:
        "If you clear Round 1, you will receive an official selection email along with next steps. This will include details about your assigned team (if applicable), problem statements, and guidelines for the final round. You'll also be added to exclusive communication channels for real-time updates.",
    },
    {
      question: 'Do we have to build a complete project during the hackathon?',
      answer:
        'A functional prototype is sufficient. It should clearly demonstrate your concept and potential impact.',
    },
    {
      question: 'Can we work on our project before the hackathon?',
      answer:
        'No, all development must happen during the official hackathon hours to ensure fairness.',
    },
    {
      question: 'What should I bring?',
      answer:
        "Bring your laptop, charger, extension board, and any specific tools or hardware you'll need.",
    },
    {
      question: 'Are there prizes?',
      answer:
        'Yes! Winners will receive cash prizes, goodies, and potential internship opportunities.',
    },
    {
      question: 'Will all participants get certificates?',
      answer:
        'Yes, every participant will receive an official participation certificate.',
    },
    {
      question: 'Will food and accommodation be provided?',
      answer:
        'Yes, meals and basic accommodation will be arranged for all offline participants.',
    },

    {
      question: 'Will there be internet access?',
      answer: 'Yes, Wi-Fi will be available at the venue.',
    },
    {
      question: 'How will I receive updates?',
      answer:
        'Updates will be shared via email, WhatsApp groups, and official announcement channels.',
    },
    {
      question: 'Will there be any travel allowance provided?',
      answer:
        'No, we will not be providing travel reimbursements. Participants are expected to arrange and cover their own travel expenses.',
    },
    {
      question: 'Can we change our team members after Round 1?',
      answer:
        'No, team compositions will be locked after Round 1 to ensure fairness and smooth coordination.',
    },
  ]

  return (
    <div className="bg-[#141414] text-[#fcf2e8] py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto mt-14">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-4xl px-10 sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#fcf2e8] mb-4 sm:mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#ccc] max-w-3xl mx-auto px-2">
            Everything you need to know about HACKWAVE 2025. Can't find what
            you're looking for? Reach out to us on social media or email.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <Accordion
            type="single"
            collapsible
            className="space-y-3 sm:space-y-4"
          >
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#fcf2e8] text-[#141414] rounded-lg sm:rounded-xl border border-[#141414]/10 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-[#141414] hover:text-[#141414]/80 transition-colors text-sm sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="text-[#141414]/80 leading-relaxed font-medium text-sm sm:text-base">
                    {typeof faq.answer === 'string' ? faq.answer : faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 sm:mt-16 px-2 sm:px-4">
          <div className="bg-[#fcf2e8] text-[#141414] rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto border border-[#141414]/10 sm:mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-[#141414] mb-3 sm:mb-4">
              Still have questions?
            </h3>
            <p className="text-[#141414]/80 mb-4 sm:mb-6 font-medium text-sm sm:text-base">
              We're here to help! Reach out to our team and we'll get back to
              you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=eds@cdgi.edu.in"
                target="blank"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-[#141414] text-[#fcf2e8] rounded-lg font-medium hover:bg-[#141414]/90 transition-colors text-sm sm:text-base"
              >
                Email Us
              </a>
              <a
                href="https://www.instagram.com/echelondevsociety"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-[#141414] text-[#141414] rounded-lg font-medium hover:bg-[#141414] hover:text-[#fcf2e8] transition-colors text-sm sm:text-base"
              >
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQSection
