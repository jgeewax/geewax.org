---
title: "Copyright in Jamaica"
description: "Intellectual property is property, which is owned by someone. Jamaica is very different from the US in this area, but how?"
date: 2015-04-03
tags: [ip]
image: /images/posts/copyright-in-jamaica/copyright.webp
---

**DISCLAIMER**: I'm not a lawyer. Get your legal advice from someone smarter. If you're interested in this topic, pick up a copy of [Cyber Law in Jamaica](http://www.amazon.com/Cyber-Law-Jamaica-Nicole-Foga/dp/9041147098).

### TL;DR

The [Paymaster v GKRS case](http://www.courtofappeal.gov.jm/sites/default/files/judgments/Paymaster%20Jamaica%20Ltd.%20v%20Grace%20Kennedy%20Remittance%20Services%20Ltd.%20%26%20Lowe%20%28Paul%29.pdf) should be a reminder to all of us that being explicit about ownership and confidentiality is important. This means we should be really careful in a few situations:

1. If you are sharing confidential information (source code, really specific strategy docs, etc) have your attorney draft an NDA (non-disclosure agreement).

2. If you are writing software or having software written for you (or writing software for your start-up), have your attorney draft an IPIAA (intellectual property and invention assignment agreement) outlining exactly who owns what.

### The longer version

Recently, the Court of Appeal ruled on [a case involving Paymaster and GraceKennedy Remittance Services](http://www.courtofappeal.gov.jm/sites/default/files/judgments/Paymaster%20Jamaica%20Ltd.%20v%20Grace%20Kennedy%20Remittance%20Services%20Ltd.%20%26%20Lowe%20%28Paul%29.pdf) which had some pretty interesting implications related to confidentiality and intellectual property ownership. This is even more interesting to me because the IP in question was actually software, so it means that we in the tech industry should see this as a friendly reminder of what we should be doing already.

But before I get into specifics, I think it's worthwhile to quickly recap this 'work-for-hire' thing.

### What is a 'work-for-hire'?

Put really simply: in the US, there's a law somewhere that says "if I pay you to produce some work, I own it, not you." There are all sorts of caveats on the type of work it can be, what the working arrangement is (employee versus contractor), and some common law tests that courts use when it's unclear who owns the work produced, but the underlying implication is actually pretty important:

> If there's no contract specifying who owns what, ownership is subject to debate.

(If you want to know more, [Wikipedia's page on Work for hire](http://en.wikipedia.org/wiki/Work_for_hire#Law_in_the_United_States) is a good place to start.)

### Does Jamaica have a work-for-hire concept?

**No.** The [Copyright Act](https://www.jipo.gov.jm/sites/default/files/PDF_Files/CopyrightAct.pdf) is pretty explicit in saying that if there is no contract, the author owns the work. End of story.

### So what happened in Paymaster v GKRS?

There were two topics at issue, which I'll address separately:

1. **Confidentiality** (*"Duty of Confidence"*), and
2. **Intellectual property ownership** (*"Copyright"*).

**Let's start with the Confidentiality piece.** Here's my understanding of the situation:

- Paymaster shared some super confidential stuff with GKRS.
- The intent of the two was to start some sort of business arrangement.
- There was no written confidentiality agreement.
- GKRS had the burden of proving that there was no duty of confidence.
- The court said GKRS carries a heavy burden if they seek to repel the contention that they were bound by an obligation of confidence. (See paragraphs 187-188 in the appeal ruling.)
- In short, the court decided that GKRS failed to show that they *didn't* use the business plans of Paymaster to gain "unfair advantage".

There's nothing all that new here, but this should serve as a friendly reminder that we should be doing a few things (if we aren't already):

1. If you are going to share super confidential stuff, have something in writing that says "we both agree to keep all of this between us and not use it unfairly".
2. If you think the company you're sharing stuff with would use it to gain an unfair advantage, don't fucking share it.

**NOTE:** I still think if you're sharing "just an idea", don't bother with paperwork (see /protecting-your-idea/ for my thoughts on this).

**And what about the intellectual property ownership piece?** Here's my understanding of the situation:

- Paymaster hired Lowe to work on software for remittances.
- Paymaster was paying Lowe for his work.
- There was no written agreement saying who owned what.
- Lowe took that software with him, left Paymaster, and later licensed it to GKRS.
- The court said that Lowe owned the copyright and was perfectly within his rights to do with the software what he wanted.

So... what does this mean exactly? This case reaffirms something really important (and different from the US):

> In Jamaica, if you have no contract in place saying who owns the software, the author owns it.

This also means we should be careful when creating intellectual property:

- If you're hiring someone to write software, get a written agreement saying who owns what.
- If you've been hired to write software, get a written agreement saying who owns what.
- If you are starting a company and plan to write software, you fall under both points above. Get an agreement saying your company owns the software.
- If you deviate from the original "scope of work" specified in your written agreement (either as the employer or the author), talk about it **beforehand** and update the agreement if necessary.

#### Here's more stuff to read...

- [Work for hire law in the US - Wikipedia](http://en.wikipedia.org/wiki/Work_for_hire#Law_in_the_United_States)
- [Patents in Jamaica](http://www.jipo.gov.jm/?q=node/45)
- [Copyright Act (Jamaica)](https://www.jipo.gov.jm/sites/default/files/PDF_Files/CopyrightAct.pdf)
- [Cyber Law in Jamaica (book)](http://www.amazon.com/Cyber-Law-Jamaica-Nicole-Foga/dp/9041147098)
- [Paymaster, Bill Express finally head to court - Jamaica Gleaner, 6 July 2009](http://mobile.jamaicagleaner.com/20090706/business/business1.php)
- [Trial set for $1.7b Paymaster, GKRS dispute - Jamaica Gleaner, 17 July 2009](http://mobile.jamaicagleaner.com/20090717/business/business2.php)
- [GKRS seeks new delay in lawsuit - Jamaica Gleaner, 22 July 2009](http://mobile.jamaicagleaner.com/20090722/business/business2.php)
- [Paymaster software built by Lowe - Jamaica Gleaner, 15 October 2009](http://mobile.jamaicagleaner.com/20091015/lead/lead5.php)
- [GKRS lawyers optimistic - Jamaica Gleaner, 16 October 2009](http://mobile.jamaicagleaner.com/20091016/lead/lead5.php)
- [Witnesses finish testimonies - Jamaica Gleaner, 21 October 2009](http://mobile.jamaicagleaner.com/20091021/lead/lead8.php)
- [Lessons from Paymaster... - Jamaica Observer, 5 May 2010](http://www.jamaicaobserver.com/business/Lessons-from-Paymaster-v-Grace_7580143)
- [Of copyright and competition - Jamaica Gleaner, 21 May 2010](http://mobile.jamaicagleaner.com/gleaner/20100521/business/business8.php)
- [Another Round for Paymaster... - Jamaica Gleaner, 25 September 2013](http://jamaica-gleaner.com/latest/article.php?id=48204)
- [Paymaster v GKRS and Paul Lowe ruling - 27 March 2015](http://www.courtofappeal.gov.jm/sites/default/files/judgments/Paymaster%20Jamaica%20Ltd.%20v%20Grace%20Kennedy%20Remittance%20Services%20Ltd.%20%26%20Lowe%20%28Paul%29.pdf)
- [Appeal court rules Paymaster vs GKRS - Jamaica Gleaner, 30 March, 2015](http://www.jamaicaobserver.com/business/Appeal-Court-rules-on-long-running-Paymaster-vs-GKRS-case_18670683)
- [Paymaster v GKRS - Myers, Fletcher, Gordon Newsletter](http://www.myersfletcher.com/newsletter-issues/item/the-law-of-confidence.html)
