
-- voting_steps table
CREATE TABLE public.voting_steps (
  id SERIAL PRIMARY KEY,
  phase TEXT NOT NULL,
  step_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pro_tip TEXT,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.voting_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voting steps are viewable by everyone"
ON public.voting_steps FOR SELECT
USING (true);

-- faqs table
CREATE TABLE public.faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQs are viewable by everyone"
ON public.faqs FOR SELECT
USING (true);

CREATE POLICY "Anyone can update faq helpful count"
ON public.faqs FOR UPDATE
USING (true)
WITH CHECK (true);

-- user_progress table
CREATE TABLE public.user_progress (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  current_step INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view progress"
ON public.user_progress FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert progress"
ON public.user_progress FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update progress"
ON public.user_progress FOR UPDATE
USING (true)
WITH CHECK (true);

-- Seed voting_steps
INSERT INTO public.voting_steps (phase, step_number, title, description, pro_tip, emoji) VALUES
('Before You Vote', 1, 'Am I eligible to vote?', 'You generally need to be a citizen and at least 18 years old on or before election day. Eligibility rules can vary slightly by region.', 'Check your country''s official election commission website to confirm your specific eligibility — it takes 30 seconds.', '🤔'),
('Before You Vote', 2, 'How do I register?', 'Most places let you register online, by mail, or in person. You''ll usually need an ID and proof of address. The process takes 5–10 minutes.', 'Register well before the deadline — last-minute registrations sometimes get delayed or rejected.', '📝'),
('Before You Vote', 3, 'What documents do I need?', 'Bring a government-issued photo ID like a driver''s license, passport, or voter ID card. Some places accept utility bills as proof of address too.', 'Take a photo of your ID with your phone as a backup — just in case you misplace it on the day.', '🪪'),
('Before You Vote', 4, 'How do I find my polling booth?', 'Your registration confirmation will list your assigned booth. You can also search online using your voter ID or address on the official election portal.', 'Visit the location once before election day if possible — knowing where to go reduces day-of stress.', '📍'),
('Before You Vote', 5, 'What should I research beforehand?', 'Read up on the candidates, their stances, and the issues on the ballot. Trusted news sources and official candidate websites are your best friends.', 'Make a small cheat sheet with your choices written down — you can bring it into the booth in most places.', '📚'),
('Inside The Booth', 6, 'What will I see when I walk in?', 'Expect a calm, organized space with poll workers, a check-in desk, voting booths or machines, and clear signage. They''re there to help you.', 'Poll workers are volunteers trained to assist — never feel embarrassed to ask any question, no matter how basic.', '🚪'),
('Inside The Booth', 7, 'How do I identify myself?', 'Hand your ID to the poll worker at check-in. They''ll verify your name on the voter list and direct you to a booth or machine.', 'Have your ID out before you reach the desk — speeds things up for you and everyone behind you.', '🤝'),
('Inside The Booth', 8, 'What does the ballot look like?', 'It''s usually a paper sheet or a digital screen listing candidates, parties, and any referendum questions. Instructions are printed clearly at the top.', 'Take a few extra seconds to read the entire ballot before marking — there may be questions on the back!', '📜'),
('Inside The Booth', 9, 'How do I mark my vote correctly?', 'Follow the instructions exactly — usually a clear mark in a box, filling a bubble, or pressing a button. Don''t add stray marks.', 'Press firmly and clearly. A weak mark might not be counted by scanners.', '✏️'),
('Inside The Booth', 10, 'What if I make a mistake?', 'Don''t panic! Tell a poll worker. They can give you a fresh ballot — most places allow you to spoil up to 2 ballots.', 'Never try to scratch out or fix a mistake yourself — it can invalidate your vote. Always ask for a new ballot.', '🙃'),
('After You Vote', 11, 'How do I know my vote counted?', 'Once your ballot is submitted, you''ll often receive a confirmation slip or hear a beep from the machine. Many systems also let you track your ballot online.', 'Snap a photo of your confirmation slip — it''s your proof you voted, useful if any disputes arise.', '✅'),
('After You Vote', 12, 'When are results announced?', 'Results trickle in as polls close. Initial counts come within hours, but final certified results can take days or even weeks for close races.', 'Avoid doom-scrolling on election night. Check trusted sources the next morning for clearer numbers.', '📊'),
('After You Vote', 13, 'What happens next?', 'Winners are sworn in after results are certified. Your vote shapes policies, budgets, and leadership for years to come. Stay engaged!', 'Voting is just the start — follow up with elected officials, attend town halls, and keep using your voice.', '🎉');

-- Seed faqs
INSERT INTO public.faqs (question, answer, category, helpful_count) VALUES
('Can anyone see who I voted for?', 'No! Voting is completely secret. Your ballot has no name on it, and modern voting systems are designed so even election workers can''t connect a vote to a voter.', 'Privacy', 0),
('What if I don''t know who to vote for?', 'That''s totally okay! Read up on candidates, check trusted news sources, or ask trusted friends. You can also leave some sections blank — partial ballots are valid.', 'Voting', 0),
('Can I bring my phone inside?', 'Most polling places allow phones but ban photography or calls inside the booth. Some places ban phones entirely. When in doubt, keep it silenced and pocketed.', 'Booth Rules', 0),
('What if I make a mistake on the ballot?', 'Just ask a poll worker for a new one — this is called "spoiling" your ballot. It''s a normal request and they''ll help you without judgment.', 'Voting', 0),
('What if my name isn''t on the list?', 'Stay calm. Ask for a "provisional ballot" — your vote will be counted once your eligibility is verified. Don''t leave without voting!', 'Eligibility', 0),
('Is it really a secret ballot?', 'Yes, 100%. Secret ballots are a foundational principle of democracy. Nobody — not your family, employer, or government — can legally find out how you voted.', 'Privacy', 0),
('What if I go to the wrong booth?', 'The poll workers will redirect you to the correct location. In some areas, you can vote anywhere with a provisional ballot — but always try your assigned booth first.', 'Logistics', 0),
('Can I change my mind inside?', 'Until you submit your ballot, yes! If you''ve marked it but haven''t submitted, ask for a new ballot. Once submitted, the vote is final.', 'Voting', 0);
