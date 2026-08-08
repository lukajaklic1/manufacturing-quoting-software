import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import AppLogo from '../components/ui/AppLogo'

const sl = {
  title: 'Izjava o zasebnosti',
  updated: 'Posodobljeno: julij 2026',
  intro: `VaĹˇe osebne podatke varujemo v skladu z Uredbo (EU) 2016/679 (GDPR), Zakonom o varstvu osebnih podatkov (ZVOP-2) in drugo veljavno zakonodajo o varstvu podatkov. Ta izjava se nanaĹˇa na fiziÄŤne osebe, ki pri Toolingdesk nastopajo kot poslovni uporabniki â€” lastnike, direktorje, kalkulatorje, prodajnike in ostale zaposlene v proizvodnih podjetjih, ki uporabljajo platformo za pripravo ponudb in upravljanje stroĹˇkovnih kalkulacij.

Toolingdesk v razmerju do vas nastopa v dveh jasno loÄŤenih vlogah. Kot upravljavec obdeluje vaĹˇe osebne podatke za namen zagotavljanja in upravljanja storitev â€” to razmerje ureja ta izjava. Kot obdelovalec pa obdeluje kontaktne in komercialne podatke vaĹˇih strank in poslovnih partnerjev, ki jih vnesete v platformo, po vaĹˇih navodilih in v vaĹˇem imenu â€” za to razmerje ste vi odgovorni kot upravljavec.`,

  s1title: '1. Podatki o upravljavcu',
  s1: `Upravljavec osebnih podatkov je TCE, d.o.o. Za vsa vpraĹˇanja v zvezi z obdelavo vaĹˇih osebnih podatkov nas kontaktirajte na info@tce.si. Na zahteve odgovorimo v roku 30 dni.`,

  s2title: '2. Katere podatke obdelujemo',
  s2cats: [
    {
      title: 'Podatki o uporabniĹˇkem raÄŤunu',
      text: 'Ime in priimek, e-poĹˇtni naslov, geslo (hranjeno izkljuÄŤno v zgoĹˇÄŤeni obliki), naziv podjetja, naslov, ID za DDV ter banÄŤni podatki za izstavitev raÄŤunov.',
    },
    {
      title: 'Podatki o strankah (obdelovalska vloga)',
      text: 'Naziv stranke, kontaktna oseba, e-poĹˇtni naslov, telefonska Ĺˇtevilka, naslov in drugi komercialni podatki, ki jih vnesete ob ustvarjanju strank v platformi. Za te podatke nastopate vi kot upravljavec â€” odgovorni ste za zakonitost njihove obdelave in ustrezno obvestitev strank.',
    },
    {
      title: 'Kalkulacije in stroĹˇkovni modeli',
      text: 'Vse stroĹˇkovne kalkulacije, ki jih ustvarite v platformi: postavke stroĹˇkov, koliÄŤine, kosi, odpadek, serijska velikost, ÄŤasi obdelave ter izraÄŤunane prodajne cene. Ti podatki so vaĹˇa izkljuÄŤna last in se obdelujejo izkljuÄŤno za zagotavljanje storitve.',
    },
    {
      title: 'Podatki o strojih in delovnih mestih',
      text: 'TehniÄŤni in stroĹˇkovni parametri vaĹˇih strojev in delovnih mest: urna postavka, stroĹˇki energije, vode, zraka, vzdrĹľevanja, amortizacije, orodij ter razpoloĹľljivi fondi ur. VkljuÄŤno z modelom, letom nabave in vrednostjo stroja.',
    },
    {
      title: 'Urne postavke dela',
      text: 'Kategorije delavnih ur z bruto plaÄŤo, socialnimi prispevki, dodatki in regresom â€” iz katerih platforma izraÄŤuna efektivno urno postavko za kalkulacije.',
    },
    {
      title: 'Podatki o materialih',
      text: 'Naziv, enota, cena na enoto in dobaviteljski podatki za materiale, ki jih vnaĹˇate v kalkulacije.',
    },
    {
      title: 'ReĹľijski stroĹˇki',
      text: 'Letni stroĹˇki po stroĹˇkovnih mestih (upravljanje, trĹľenje, razvoj, administracija ipd.), iz katerih platforma izraÄŤuna reĹľijsko stopnjo za vsako kalkulacijo.',
    },
    {
      title: 'Ponudbe in priponke',
      text: 'Ustvarjene ponudbe z vsemi postavkami, cenami, pogoji, kontaktnimi podatki in statusom (osnutek, izdano, poslano, pridobljeno, izgubljeno). PriloĹľene datoteke: tehniÄŤne risbe, specifikacije, modeli (PDF, DWG, SLDPRT, PNG in drugi formati).',
    },
    {
      title: 'TehniÄŤni podatki o uporabi',
      text: 'ÄŚas dostopa, IP naslov (za varnostne namene, psevdonimiziran po 30 dneh), operacijski sistem in brskalnik. Revizijska sled sprememb znotraj platforme.',
    },
  ],

  s3title: '3. Zakaj obdelujemo vaĹˇe podatke',
  s3items: [
    {
      title: 'Upravljanje raÄŤuna in zagotavljanje storitev',
      text: 'Upravljanje dostopov, zagotavljanje delovanja platforme in vseh njenih funkcionalnosti (kalkulacije, ponudbe, stranke, priponke, analitika).',
      basis: 'Izpolnitev pogodbe (ÄŤl. 6(1)(b) GDPR)',
      retention: 'Celotno obdobje trajanja pogodbe; izbris v 30 dneh po prenehanju.',
    },
    {
      title: 'ObraÄŤunavanje, izdajanje raÄŤunov in davÄŤne obveznosti',
      text: 'Obdelava podatkov o plaÄŤilih, izdanih raÄŤunih in transakcijah za namene obraÄŤunavanja naroÄŤnine ter izpolnjevanja davÄŤnih in raÄŤunovodskih obveznosti.',
      basis: 'Izpolnitev pogodbe + zakonska obveznost (ÄŤl. 6(1)(b) in (c) GDPR)',
      retention: '10 let v skladu z ZDavP-2.',
    },
    {
      title: 'Podpora strankam',
      text: 'Komunikacijske podatke iz stikov s podporo hranimo za zagotavljanje kontinuirane podpore in reĹˇevanja tehniÄŤnih teĹľav.',
      basis: 'Zakoniti interes (ÄŤl. 6(1)(f) GDPR)',
      retention: '3 leta po zakljuÄŤku posamezne zadeve.',
    },
    {
      title: 'Varnost platforme in prepreÄŤevanje zlorab',
      text: 'TehniÄŤne podatke o dostopu obdelujemo za zaznavanje nepooblaĹˇÄŤenih dostopov, prepreÄŤevanje zlorab in zagotavljanje varnega delovanja platforme.',
      basis: 'Zakoniti interes (ÄŤl. 6(1)(f) GDPR)',
      retention: 'IP naslovi psevdonimiziranimi po 30 dneh; varnostni zapisi izbrisani po 12 mesecih.',
    },
    {
      title: 'Analitika in razvoj storitev',
      text: 'Agregirane in anonimizirane podatke o uporabi obdelujemo za razvoj novih funkcionalnosti in izboljĹˇanje uporabniĹˇke izkuĹˇnje.',
      basis: 'Zakoniti interes (ÄŤl. 6(1)(f) GDPR)',
      retention: 'Anonimizirani podatki se hranijo trajno; osebni podatki za analitiÄŤne namene do 24 mesecev.',
    },
    {
      title: 'ObveĹˇÄŤanje o storitvah',
      text: 'ObstojeÄŤe stranke obÄŤasno obveĹˇÄŤamo o posodobitvah platforme in novih funkcionalnostih. Pravico do ugovora po ÄŤl. 21 GDPR upoĹˇtevamo takoj in brezpogojno.',
      basis: 'Zakoniti interes (ÄŤl. 6(1)(f) GDPR)',
      retention: 'Do odjave.',
    },
    {
      title: 'Uveljavljanje pravnih zahtevkov',
      text: 'V primeru pravnih sporov ali regulatornih postopkov hranimo relevantne podatke za namene uveljavljanja ali obrambe pravnih zahtevkov.',
      basis: 'Zakoniti interes (ÄŤl. 6(1)(f) GDPR)',
      retention: 'Do zakljuÄŤka postopka in 5 let po njem.',
    },
  ],

  s4title: '4. Kdo obdeluje vaĹˇe podatke',
  s4: `VaĹˇi podatki so dostopni le omejenemu krogu oseb pri Toolingdesk â€” izkljuÄŤno tistim, ki podatke potrebujejo za opravljanje svojih nalog. Vsi so zavezani k zaupnosti.

Za doloÄŤene storitve uporabljamo zunanje obdelovalce, s katerimi imamo sklenjene pogodbe o obdelavi podatkov po ÄŤl. 28 GDPR:`,
  s4processors: [
    ['Supabase Inc.', 'Gostovanje podatkov in avtentikacija', 'EU (Frankfurt, NemÄŤija)'],
    ['Vercel Inc.', 'Gostovanje aplikacije', 'EU / globalna CDN'],
  ],
  s4end: `VaĹˇe podatke razkrijemo drĹľavnim organom le, kadar je to zahtevano na podlagi zakona. V primeru pravnih sporov jih lahko razkrijemo odvetnikom in sodiĹˇÄŤem v obsegu, ki je nujen za zaĹˇÄŤito pravnih interesov.`,

  s5title: '5. Prenos podatkov v tretje drĹľave',
  s5: `Toolingdesk hrani in obdeluje podatke primarno v Evropski uniji (Supabase Frankfurt, Vercel EU). V kolikor bi pri prihodnji nadgradnji infrastrukture priĹˇlo do prenosa osebnih podatkov izven EGP, bo Toolingdesk to zagotovil izkljuÄŤno z ustreznimi zaĹˇÄŤitnimi mehanizmi (Standardne pogodbene klavzule Evropske komisije po Izvedbeni odloÄŤbi 2021/914 ali odloÄŤba o ustreznosti).

Imate pravico zahtevati informacije o drĹľavah, v katere se vaĹˇi podatki prenaĹˇajo. Zahtevo naslovite na info@tce.si.`,

  s6title: '6. Varnost podatkov',
  s6: 'VaĹˇe podatke varujemo s tehniÄŤnimi in organizacijskimi ukrepi, ki vkljuÄŤujejo:',
  s6items: [
    'Ĺ ifriranje podatkov med prenosom (TLS 1.2+) in v stanju mirovanja (AES-256)',
    'Nadzor dostopa na podlagi naÄŤela najmanjĹˇega potrebnega dostopa (RBAC)',
    'VeÄŤfaktorska avtentikacija za dostop do infrastrukture',
    'LoÄŤena razvojna in produkcijska okolja brez prenosa produkcijskih podatkov v testna okolja',
    'Redne varnostne kopije in preizkusi obnove',
    'Centralizirane revizijske dnevnike in alarmiranje ob sumljivih dejanjih',
  ],
  s6end: 'V primeru varnostnega incidenta, ki bi verjetno povzroÄŤil visoko tveganje za vaĹˇe pravice in svoboĹˇÄŤine, vas bomo nemudoma obvestili v skladu s ÄŤl. 34 GDPR.',

  s7title: '7. VaĹˇe pravice',
  s7intro: 'Na vse zahteve odgovorimo v roku 30 dni; pri kompleksnih zahtevah si pridrĹľujemo pravico do podaljĹˇanja za najveÄŤ 2 meseca, o ÄŤemer vas predhodno obvestimo.',
  s7items: [
    ['Pravica do dostopa (ÄŤl. 15)', 'Zahtevate kopijo osebnih podatkov, ki jih obdelujemo v zvezi z vami, in informacije o naravi, namenu ter obsegu obdelave.'],
    ['Pravica do popravka (ÄŤl. 16)', 'Zahtevate popravek netoÄŤnih ali dopolnitev nepopolnih osebnih podatkov.'],
    ['Pravica do izbrisa (ÄŤl. 17)', 'Zahtevate izbris svojih osebnih podatkov, kadar ni veÄŤ podlage za njihovo obdelavo. Pravica je omejena z zakonskimi obveznostmi hrambe (npr. davÄŤna dokumentacija).'],
    ['Pravica do omejitve obdelave (ÄŤl. 18)', 'Zahtevate zaÄŤasno omejitev obdelave vaĹˇih podatkov, dokler ne razreĹˇimo morebitnih nesoglasij.'],
    ['Pravica do ugovora (ÄŤl. 21)', 'Ugovarjate obdelavi na podlagi zakonitega interesa. Ugovor za namene direktnega marketinga je absoluten in brezpogojen â€” upoĹˇtevamo ga takoj.'],
    ['Pravica do prenosljivosti (ÄŤl. 20)', 'Zahtevate vaĹˇe osebne podatke v strukturirani, strojno berljivi obliki ali njihov neposredni prenos k drugemu upravljavcu.'],
    ['Pravica do preklica privolitve (ÄŤl. 7)', 'Kadar koli in brez posledic prekliÄŤete privolitev za katero koli obdelavo, ki na njej temelji. Preklic ne vpliva na zakonitost obdelave pred preklicem.'],
  ],
  s7end: 'Zahteve naslovite na info@tce.si. Imate tudi pravico do pritoĹľbe pri Informacijskemu pooblaĹˇÄŤencu RS, Dunajska cesta 22, 1000 Ljubljana, gp.ip@ip-rs.si, ip-rs.si.',

  s8title: '8. PiĹˇkotki',
  s8: 'Toolingdesk uporablja izkljuÄŤno tehniÄŤno nujne piĹˇkotke za upravljanje seje in avtentikacijo. Ne nastavljamo analitiÄŤnih, sledilnih ali oglaĹˇevalskih piĹˇkotkov, zato privolitev za piĹˇkotke ni potrebna.',

  s9title: '9. Spremembe te izjave',
  s9: 'To izjavo redno pregledujemo in posodabljamo. O bistvenih spremembah vas obvestimo vsaj 30 dni pred njihovo uveljavitvijo prek e-poĹˇte ali obvestila v aplikaciji. Arhiv prejĹˇnjih verzij je dostopen na zahtevo pri info@tce.si.',

  s10title: '10. Kontakt',
  s10: 'Za vsa vpraĹˇanja v zvezi z zasebnostjo nas kontaktirajte na',
  back: 'â† Nazaj na domaÄŤo stran',
}

const en = {
  title: 'Privacy Policy',
  updated: 'Last updated: July 2026',
  intro: `We protect your personal data in accordance with Regulation (EU) 2016/679 (GDPR), the Personal Data Protection Act (ZVOP-2) and other applicable data protection legislation. This policy applies to natural persons acting as business users of Toolingdesk â€” owners, directors, estimators, sales staff and other employees of manufacturing companies using the platform to prepare quotations and manage cost calculations.

Toolingdesk acts in two clearly distinct roles. As a controller, it processes your personal data for the purpose of providing and managing the services â€” this relationship is governed by this policy. As a processor, it processes contact and commercial data of your customers and business partners that you enter into the platform, on your instructions and on your behalf â€” you are responsible for that relationship as the data controller.`,

  s1title: '1. Data Controller',
  s1: `The data controller is TCE, d.o.o. For all questions regarding the processing of your personal data, contact us at info@tce.si. We respond to requests within 30 days.`,

  s2title: '2. What Data We Collect',
  s2cats: [
    {
      title: 'Account data',
      text: 'First name, last name, email address, password (stored exclusively in hashed form), company name, address, VAT ID and bank details for invoicing.',
    },
    {
      title: 'Customer data (processor role)',
      text: 'Customer name, contact person, email address, phone number, address and other commercial data you enter when creating customers in the platform. For this data you act as the controller â€” you are responsible for the lawfulness of its processing and for properly informing your customers.',
    },
    {
      title: 'Calculations and cost models',
      text: 'All cost calculations you create in the platform: cost line items, quantities, pieces, scrap, batch size, machining times and calculated selling prices. This data is your exclusive property and is processed solely to provide the service.',
    },
    {
      title: 'Machine and workstation data',
      text: 'Technical and cost parameters of your machines and workstations: hourly rate, energy costs, water, compressed air, maintenance, depreciation, tooling costs and available operating hours. Including machine model, year of purchase and value.',
    },
    {
      title: 'labor rates',
      text: 'labor categories with gross salary, social contributions, allowances and holiday pay â€” from which the platform calculates the effective hourly rate for use in calculations.',
    },
    {
      title: 'Material data',
      text: 'Name, unit, price per unit and supplier information for materials used in calculations.',
    },
    {
      title: 'Overhead costs',
      text: 'Annual costs by cost centre (management, marketing, R&D, administration, etc.) from which the platform calculates the overhead rate applied to each calculation.',
    },
    {
      title: 'Quotations and attachments',
      text: 'Created quotations with all line items, prices, terms, contact data and status (draft, issued, sent, won, lost). Attached files: technical drawings, specifications, models (PDF, DWG, SLDPRT, PNG and other formats).',
    },
    {
      title: 'Technical usage data',
      text: 'Access timestamps, IP address (for security purposes, pseudonymised after 30 days), operating system and browser. Audit trail of changes within the platform.',
    },
  ],

  s3title: '3. Why We Process Your Data',
  s3items: [
    {
      title: 'Account management and service delivery',
      text: 'Managing access, ensuring platform operation and all its features (calculations, quotations, customers, attachments, analytics).',
      basis: 'Contract (Art. 6(1)(b) GDPR)',
      retention: 'Full duration of the agreement; deleted within 30 days of termination.',
    },
    {
      title: 'Billing, invoicing and tax obligations',
      text: 'Processing payment, invoice and transaction data for subscription billing and fulfilment of tax and accounting obligations.',
      basis: 'Contract + legal obligation (Art. 6(1)(b) and (c) GDPR)',
      retention: '10 years under applicable tax law.',
    },
    {
      title: 'Customer support',
      text: 'Communication data from support interactions is retained for providing continuous support and resolving technical issues.',
      basis: 'Legitimate interest (Art. 6(1)(f) GDPR)',
      retention: '3 years after closure of each case.',
    },
    {
      title: 'Platform security and abuse prevention',
      text: 'Technical access data is processed to detect unauthorized access, prevent abuse and ensure secure platform operation.',
      basis: 'Legitimate interest (Art. 6(1)(f) GDPR)',
      retention: 'IP addresses pseudonymised after 30 days; security logs deleted after 12 months.',
    },
    {
      title: 'Analytics and service improvement',
      text: 'Aggregated and anonymised usage data is processed for developing new features and improving user experience.',
      basis: 'Legitimate interest (Art. 6(1)(f) GDPR)',
      retention: 'Anonymised data retained indefinitely; personal data for analytics up to 24 months.',
    },
    {
      title: 'Service communications',
      text: 'We occasionally inform existing customers about platform updates and new features. Your right to object under Art. 21 GDPR is honoured immediately and unconditionally.',
      basis: 'Legitimate interest (Art. 6(1)(f) GDPR)',
      retention: 'Until unsubscribe.',
    },
    {
      title: 'Establishing legal claims',
      text: 'In the event of legal disputes or regulatory proceedings, we retain relevant data for the purpose of establishing or defending legal claims.',
      basis: 'Legitimate interest (Art. 6(1)(f) GDPR)',
      retention: 'Until conclusion of proceedings and 5 years thereafter.',
    },
  ],

  s4title: '4. Who Processes Your Data',
  s4: `Your data is accessible only to a limited circle of persons at Toolingdesk â€” exclusively those who need the data to perform their duties. All are bound by confidentiality.

For certain services we use external processors with whom we have data processing agreements under Art. 28 GDPR:`,
  s4processors: [
    ['Supabase Inc.', 'Data storage and authentication', 'EU (Frankfurt, Germany)'],
    ['Vercel Inc.', 'Application hosting', 'EU / global CDN'],
  ],
  s4end: `We disclose your data to public authorities only when required by law. In legal disputes, we may disclose it to lawyers and courts to the extent necessary to protect legal interests.`,

  s5title: '5. International Data Transfers',
  s5: `Toolingdesk stores and processes data primarily within the European Union (Supabase Frankfurt, Vercel EU). Should any future infrastructure upgrade involve transfers of personal data outside the EEA, Toolingdesk will ensure this is done exclusively with appropriate safeguards (European Commission Standard Contractual Clauses under Implementing Decision 2021/914 or an adequacy decision).

You have the right to request information about the countries to which your data is transferred. Send your request to info@tce.si.`,

  s6title: '6. Data Security',
  s6: 'We protect your data with technical and organisational measures including:',
  s6items: [
    'Encryption of data in transit (TLS 1.2+) and at rest (AES-256)',
    'Access control based on the principle of least privilege (RBAC)',
    'Multi-factor authentication for infrastructure access',
    'Separate development and production environments, no production data in test environments',
    'Regular backups and restoration tests',
    'Centralized audit logs and alerting on suspicious activity',
  ],
  s6end: 'In the event of a security incident likely to result in a high risk to your rights and freedoms, we will notify you without undue delay in accordance with Art. 34 GDPR.',

  s7title: '7. Your Rights',
  s7intro: 'We respond to all requests within 30 days; for complex requests we reserve the right to extend by up to 2 months, of which we will notify you in advance.',
  s7items: [
    ['Right of access (Art. 15)', 'Request a copy of the personal data we process about you and information about the nature, purpose and scope of processing.'],
    ['Right to rectification (Art. 16)', 'Request correction of inaccurate or completion of incomplete personal data.'],
    ['Right to erasure (Art. 17)', 'Request deletion of your personal data where there is no longer a legal basis for processing. The right is subject to legal retention obligations (e.g. tax records).'],
    ['Right to restriction (Art. 18)', 'Request a temporary restriction on the processing of your data while any substantive disputes are resolved.'],
    ['Right to object (Art. 21)', 'Object to processing based on legitimate interest. Objection to processing for direct marketing purposes is absolute and unconditional â€” we honour it immediately.'],
    ['Right to portability (Art. 20)', 'Request your personal data in a structured, machine-readable format or their direct transfer to another controller.'],
    ['Right to withdraw consent (Art. 7)', 'Withdraw consent at any time and without consequences for any processing based on it. Withdrawal does not affect the lawfulness of processing before withdrawal.'],
  ],
  s7end: 'Submit requests to info@tce.si. You also have the right to lodge a complaint with the Information Commissioner of the Republic of Slovenia, Dunajska cesta 22, 1000 Ljubljana, gp.ip@ip-rs.si, ip-rs.si.',

  s8title: '8. Cookies',
  s8: 'Toolingdesk uses only technically necessary cookies for session management and authentication. We do not set analytics, tracking or advertising cookies, so cookie consent is not required.',

  s9title: '9. Changes to This Policy',
  s9: 'We regularly review and update this policy. We will notify you of significant changes at least 30 days before they take effect via email or an in-app notice. An archive of previous versions is available on request at info@tce.si.',

  s10title: '10. Contact',
  s10: 'For all privacy-related questions, contact us at',
  back: 'â† Back to home',
}

export default function PrivacyPage() {
  const { lang, setLang } = useLanguage()
  const t = lang === 'sl' ? sl : en
  const isSl = lang === 'sl'

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><AppLogo size="sm" /></Link>
          <div className="flex gap-1">
            {(['en', 'sl'] as const).map(lng => (
              <button key={lng} onClick={() => setLang(lng)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${lang === lng ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                {lng.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-400 text-sm mb-10">{t.updated}</p>

        <div className="space-y-10 text-gray-600 leading-relaxed">

          {/* Intro */}
          <div className="space-y-3">
            {t.intro.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.s1title}</h2>
            {t.s1.split('\n\n').map((p, i) => <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>)}
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.s2title}</h2>
            <div className="space-y-4">
              {t.s2cats.map((c, i) => (
                <div key={i} className="pl-4 border-l-2 border-gray-200">
                  <p className="font-medium text-gray-800 mb-1">{c.title}</p>
                  <p className="text-sm">{c.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.s3title}</h2>
            <div className="space-y-6">
              {t.s3items.map((item, i) => (
                <div key={i}>
                  <p className="font-medium text-gray-800 mb-1">{item.title}</p>
                  <p>{item.text}</p>
                  <p className="mt-1 text-sm text-gray-400">{isSl ? 'Pravna podlaga' : 'Legal basis'}: {item.basis}. {isSl ? 'Hramba' : 'Retention'}: {item.retention}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.s4title}</h2>
            {t.s4.split('\n\n').map((p, i) => <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>)}
            <ul className="list-disc pl-6 space-y-1 mt-3">
              {t.s4processors.map(([p, purp, loc], i) => (
                <li key={i}><strong>{p}</strong> â€” {purp} ({loc})</li>
              ))}
            </ul>
            <p className="mt-3">{t.s4end}</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.s5title}</h2>
            {t.s5.split('\n\n').map((p, i) => <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>)}
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.s6title}</h2>
            <p className="mb-3">{t.s6}</p>
            <ul className="list-disc pl-6 space-y-1">
              {t.s6items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-4">{t.s6end}</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.s7title}</h2>
            <p className="mb-4">{t.s7intro}</p>
            <div className="space-y-3">
              {t.s7items.map(([right, desc], i) => (
                <div key={i} className="flex gap-2">
                  <span className="font-medium text-gray-800 shrink-0">{right} â€”</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-4">{t.s7end.split('ip-rs.si.')[0]}<a href="https://www.ip-rs.si" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ip-rs.si</a>.</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.s8title}</h2>
            <p>{t.s8}</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.s9title}</h2>
            <p>{t.s9}</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.s10title}</h2>
            <p>{t.s10} <a href="mailto:info@tce.si" className="text-blue-600 hover:underline">info@tce.si</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link to="/" className="text-sm text-blue-600 hover:underline">{t.back}</Link>
        </div>
      </div>
    </div>
  )
}

