import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import AppLogo from '../components/ui/AppLogo'

/* ─── tiny helpers ─────────────────────────────────────────────────── */
function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-gray-900 mb-1">{children}</h1>
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3 pb-1 border-b border-gray-100">{children}</h2>
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{children}</h3>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed mb-3">{children}</p>
}
function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 space-y-1 mb-3">
      {items.map((item, i) => <li key={i} className="text-gray-600">{item}</li>)}
    </ul>
  )
}
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => <th key={i} className="text-left px-4 py-2 border border-gray-200 font-semibold text-gray-700">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j} className="px-4 py-2 border border-gray-200 text-gray-600 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TermsPage() {
  const { lang, setLang } = useLanguage()
  const sl = lang === 'sl'

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Nav */}
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

        {/* Title */}
        <H1>{sl ? 'Splošni pogoji uporabe storitve Toolingdesk' : 'Toolingdesk Terms of Service'}</H1>
        <div className="text-sm text-gray-400 space-y-0.5 mt-3 mb-6">
          <p><span className="font-medium text-gray-500">{sl ? 'Različica:' : 'Version:'}</span> Beta</p>
          <p><span className="font-medium text-gray-500">{sl ? 'Datum začetka veljavnosti:' : 'Effective date:'}</span> {sl ? '8. avgust 2026' : '8 August 2026'}</p>
          <p><span className="font-medium text-gray-500">{sl ? 'Ponudnik:' : 'Provider:'}</span> Bimetric</p>
          <p><span className="font-medium text-gray-500">{sl ? 'Kontakt:' : 'Contact:'}</span> <a href="mailto:info@bimetric.si" className="text-blue-600 hover:underline">info@bimetric.si</a></p>
        </div>


        {/* ── I. SPLOŠNE DOLOČBE ── */}
        <H2>{sl ? 'I. SPLOŠNE DOLOČBE' : 'I. GENERAL PROVISIONS'}</H2>

        <H3>{sl ? '1. člen – Predmet in obseg pogojev' : 'Article 1 – Scope and subject matter'}</H3>
        <P>{sl
          ? 'Ti splošni pogoji uporabe (v nadaljevanju: »Pogoji«) urejajo dostop do in uporabo spletne programske rešitve Toolingdesk, vključno z njenimi spletnimi aplikacijami, uporabniškimi vmesniki, funkcionalnostmi, izračuni, dokumentacijo, izvozi, integracijami, programskimi vmesniki ter drugimi povezanimi storitvami, ki jih Ponudnik omogoči uporabnikom (skupaj: »Storitev« ali »Toolingdesk«).'
          : 'These Terms of Service ("Terms") govern access to and use of the Toolingdesk web-based software solution, including its web applications, user interfaces, features, calculations, documentation, exports, integrations, APIs and other related services made available by the Provider (together, the "Service" or "Toolingdesk").'}</P>
        <P>{sl
          ? 'Pogoji predstavljajo pogodbeno razmerje med Ponudnikom in poslovnim subjektom oziroma drugo osebo, ki Storitev uporablja v okviru svoje poslovne, poklicne ali pridobitne dejavnosti (v nadaljevanju: »Naročnik«). Posamezna fizična oseba, ki uporablja Storitev v imenu Naročnika, je »Uporabnik«.'
          : 'These Terms form a contractual relationship between the Provider and a business entity or other person using the Service in the course of a business, professional or commercial activity ("Customer"). An individual using the Service on behalf of a Customer is a "User".'}</P>
        <P>{sl
          ? 'Z registracijo računa, potrditvijo teh Pogojev ali uporabo Storitev Naročnik in Uporabnik potrjujeta, da sta Pogoje prebrala, jih razumeta in se z njimi strinjata.'
          : 'By registering an account, accepting these Terms or using the Service, the Customer and User confirm that they have read, understood and accepted these Terms.'}</P>
        <P>{sl
          ? 'Če Uporabnik uporablja Storitev za pravno osebo, samostojnega podjetnika ali drug poslovni subjekt, izjavlja, da ima ustrezno pooblastilo, da ta subjekt zaveže k tem Pogojem.'
          : 'If a User uses the Service on behalf of a legal entity, sole trader or other business, the User represents that they are authorised to bind that entity to these Terms.'}</P>
        <P>{sl
          ? 'Morebitni individualni pisni dogovor med Ponudnikom in Naročnikom ima prednost pred temi Pogoji v delu, v katerem izrecno določa drugače.'
          : 'Any individually negotiated written agreement between the Provider and the Customer prevails over these Terms to the extent it expressly provides otherwise.'}</P>
        <P>{sl
          ? 'Storitev je namenjena izključno uporabi med poslovnimi subjekti oziroma za poslovne, poklicne, proizvodne, inženirske, kalkulacijske ali komercialne namene (»B2B«). Fizična oseba se lahko tehnično registrira ali uporablja Storitev, vendar z uporabo izjavlja, da jo uporablja v okviru poslovne ali poklicne dejavnosti in ne kot potrošnik za zasebne ali gospodinjske namene.'
          : 'The Service is intended exclusively for business-to-business ("B2B") use in connection with a business, professional, manufacturing, engineering, estimating or commercial activity. A natural person may technically register or use the Service, but by doing so represents that the Service is being used for business or professional purposes and not as a consumer for private or household purposes.'}</P>

        <H3>{sl ? '2. člen – Opredelitev pojmov' : 'Article 2 – Definitions'}</H3>
        <Ul items={sl ? [
          '»Ponudnik« pomeni Bimetric, kontakt info@bimetric.si.',
          '»Naročnik« pomeni poslovni subjekt ali drugega poslovnega uporabnika, za katerega se ustvari ali uporablja račun Toolingdesk.',
          '»Uporabnik« pomeni fizično osebo, ki jo Naročnik pooblasti za uporabo Storitev.',
          '»Račun« pomeni uporabniški oziroma organizacijski račun Toolingdesk.',
          '»Uporabniški podatki« pomenijo vse podatke, vsebine, dokumente, datoteke, zapise in informacije, ki jih Naročnik ali Uporabnik vnese, naloži, ustvari, shrani, uvozi ali drugače obdela prek Storitev.',
          '»Proizvodni podatki« pomenijo zlasti podatke o izdelkih, materialih, dimenzijah, količinah, strojih, operacijah, časih, urnih postavkah, stroških dela, orodjih, režijskih stroških, cenah, kupcih, dobaviteljih, maržah, pribitkih in tehnoloških postopkih.',
          '»Tehnična dokumentacija« pomeni CAD, STEP, DXF, PDF, risbe, modele, specifikacije, kosovnice, fotografije in druge tehnične datoteke.',
          '»Predkalkulacija« pomeni izračun ali oceno stroškov, časa, cen, pribitkov, marž oziroma drugih ekonomskih ali proizvodnih parametrov.',
          '»Ponudba« pomeni dokument ali drug rezultat, ki ga Uporabnik pripravi s pomočjo Storitev za lastne poslovne namene ali za posredovanje tretji osebi.',
          '»Rezultat« pomeni vsak izračun, prikaz, poročilo, predlog, oceno ali drug izhod, ustvarjen v Storitev.',
          '»Beta Storitev« pomeni funkcionalnost ali celotno Storitev, ki je še v testiranju, razvoju ali zgodnji uporabi ter za katero Ponudnik ne zagotavlja enake stopnje stabilnosti, razpoložljivosti ali podpore kot pri morebitni kasnejši komercialni različici.',
          '»Podobdelovalec« pomeni tretjo osebo, ki za Ponudnika obdeluje osebne podatke, kadar Ponudnik nastopa kot obdelovalec po GDPR.',
        ] : [
          '"Provider" means Bimetric, contact info@bimetric.si.',
          '"Customer" means a business entity or other business user for whom a Toolingdesk account is created or used.',
          '"User" means an individual authorised by the Customer to use the Service.',
          '"Account" means a user or organisation account in Toolingdesk.',
          '"Customer Data" means all data, content, documents, files, records and information entered, uploaded, created, stored, imported or otherwise processed through the Service by or on behalf of the Customer.',
          '"Manufacturing Data" includes product, material, dimension, quantity, machine, operation, cycle-time, labour-rate, tooling-cost, overhead, price, customer, supplier, margin, markup and process data.',
          '"Technical Documentation" means CAD, STEP, DXF, PDF, drawings, models, specifications, bills of materials, photographs and other technical files.',
          '"Cost Estimate" means a calculation or estimate of costs, times, prices, markups, margins or other economic or manufacturing parameters.',
          '"Quote" means a document or other output prepared with the Service for the Customer\'s business purposes or for delivery to a third party.',
          '"Output" means any calculation, display, report, proposal, estimate or other output created by the Service.',
          '"Beta Service" means a feature or the Service as a whole that is still under testing, development or early use and for which the Provider does not guarantee the same level of stability, availability or support as a later commercial release.',
          '"Subprocessor" means a third party processing personal data for the Provider where the Provider acts as a processor under the GDPR.',
        ]} />

        {/* ── II. ── */}
        <H2>{sl ? 'II. PRAVICA UPORABE IN UPORABNIŠKI RAČUNI' : 'II. RIGHT TO USE AND USER ACCOUNTS'}</H2>

        <H3>{sl ? '3. člen – Pravica uporabe' : 'Article 3 – Right to use'}</H3>
        <P>{sl
          ? 'Ob upoštevanju teh Pogojev Ponudnik Naročniku za čas veljavnega dostopa podeljuje omejeno, preklicno, neizključno, neprenosljivo in nepodlicenčno pravico do uporabe Storitev za interne poslovne namene.'
          : 'Subject to these Terms, the Provider grants the Customer a limited, revocable, non-exclusive, non-transferable and non-sublicensable right to use the Service for internal business purposes during the period in which access is valid.'}</P>
        <P>{sl
          ? 'Ta pravica ne pomeni prenosa lastništva programske opreme, izvorne kode, arhitekture, podatkovnega modela, grafičnega vmesnika, metod, algoritmov, blagovnih znamk ali drugih pravic intelektualne lastnine Ponudnika.'
          : 'This right does not transfer ownership of the software, source code, architecture, data model, user interface, methods, algorithms, trademarks or other intellectual property rights of the Provider.'}</P>
        <P>{sl
          ? 'Naročnik Storitev ne sme preprodajati, oddajati v najem, zagotavljati kot lastno SaaS storitev, uporabljati kot storitveni biro ali dati na voljo za razvoj neposredno konkurenčnega produkta brez predhodnega pisnega soglasja Ponudnika.'
          : 'The Customer may not resell, rent, provide as its own SaaS service, operate as a service bureau or use the Service to develop a directly competing product without the Provider\'s prior written consent.'}</P>
        <P>{sl
          ? 'Naročnik lahko rezultate, ponudbe, poročila in druge dokumente, ki jih ustvari s Storitev, uporablja za svoje poslovanje ter jih posreduje svojim kupcem, dobaviteljem, svetovalcem in poslovnim partnerjem.'
          : 'The Customer may use and share quotes, reports and other outputs created with the Service for its normal business operations.'}</P>

        <H3>{sl ? '4. člen – Registracija in varnost računa' : 'Article 4 – Registration and account security'}</H3>
        <P>{sl
          ? 'Za uporabo Storitev je lahko potrebna registracija. Naročnik zagotavlja, da so podatki, vneseni ob registraciji, točni, popolni in ažurni.'
          : 'Registration may be required. The Customer must ensure that registration information is accurate, complete and current.'}</P>
        <P>{sl
          ? 'Naročnik je odgovoren za določanje oseb, ki lahko dostopajo do njegovega Računa, za dodeljevanje ustreznih pravic ter za pravočasno ukinitev dostopa. Uporabniki morajo varovati prijavne podatke in jih ne smejo neupravičeno posredovati tretjim osebam. Naročnik mora Ponudnika brez nepotrebnega odlašanja obvestiti o sumu nepooblaščenega dostopa, kraji poverilnic ali drugi zlorabi Računa. Naročnik je odgovoren za dejanja svojih pooblaščenih Uporabnikov.'
          : 'The Customer is responsible for determining who may access its Account, assigning appropriate permissions and promptly removing access when no longer required. Users must keep credentials confidential and must not improperly disclose them to third parties. The Customer must notify the Provider without undue delay of suspected unauthorised access, stolen credentials or other misuse. The Customer is responsible for the actions of its authorised Users.'}</P>

        <H3>{sl ? '5. člen – Prepovedana uporaba' : 'Article 5 – Prohibited use'}</H3>
        <P>{sl ? 'Storitev se sme uporabljati le zakonito in v skladu z njenim namenom. Brez predhodnega pisnega dovoljenja Ponudnika ni dovoljeno:' : 'The Service may be used only lawfully and for its intended purpose. Without the Provider\'s prior written permission, the Customer must not:'}</P>
        <Ul items={sl ? [
          'izvajati povratnega inženirstva, dekompilacije ali razstavljanja, razen kjer tega po prisilnem pravu ni dovoljeno omejiti;',
          'obiti varnostnih ali tehničnih omejitev;',
          'izvajati scraping, avtomatizirano masovno pridobivanje podatkov ali nesorazmerno obremenjevanje Storitev;',
          'izvajati nepooblaščeno varnostno testiranje, napade ali razširjati zlonamerno kodo;',
          'nalagati nezakonite vsebine ali vsebine, za katere Naročnik nima ustreznih pravic;',
          'uporabljati Storitev za goljufijo, kršitev sankcij, izvoznih omejitev ali drugih predpisov;',
          'lažno predstavljati identiteto druge osebe ali organizacije.',
        ] : [
          'reverse engineer, decompile or disassemble the Service except where such restriction is unenforceable under mandatory law;',
          'bypass security or technical restrictions;',
          'perform scraping, automated bulk extraction or disproportionate load generation;',
          'conduct unauthorised security testing, attacks or distribute malicious code;',
          'upload unlawful content or content for which the Customer lacks sufficient rights;',
          'use the Service for fraud, sanctions violations, export-control violations or other unlawful activity;',
          'impersonate another person or organisation.',
        ]} />
        <P>{sl
          ? 'Ponudnik lahko ob utemeljenem sumu kršitve začasno omeji dostop, če je to razumno potrebno za zaščito Storitev, podatkov, drugih uporabnikov ali tretjih oseb.'
          : 'The Provider may temporarily restrict access where there is a reasonable suspicion of a breach and restriction is reasonably necessary to protect the Service, data, other users or third parties.'}</P>

        {/* ── III. ── */}
        <H2>{sl ? 'III. INTELEKTUALNA LASTNINA, PODATKI IN ZAUPNOST' : 'III. INTELLECTUAL PROPERTY, DATA AND CONFIDENTIALITY'}</H2>

        <H3>{sl ? '6. člen – Intelektualna lastnina' : 'Article 6 – Intellectual property'}</H3>
        <P>{sl
          ? 'Toolingdesk, njegova programska koda, arhitektura, podatkovni modeli, uporabniški vmesnik, grafični elementi, dokumentacija, metodologije, funkcionalnosti in drugi elementi, ki niso Uporabniški podatki, so last Ponudnika oziroma njegovih licencodajalcev. Nobena določba teh Pogojev na Naročnika ne prenaša lastninske ali druge pravice intelektualne lastnine, razen omejene pravice uporabe, izrecno določene v teh Pogojih. Naročnik ne sme odstraniti oznak avtorskih pravic, blagovnih znamk ali drugih obvestil o lastništvu. Ponudnik naziva, blagovne znamke ali logotipa Naročnika ne bo objavil kot reference ali promocijskega gradiva brez ločenega predhodnega soglasja Naročnika.'
          : 'Toolingdesk, its software code, architecture, data models, user interface, graphical elements, documentation, methodologies and features, excluding Customer Data, are owned by the Provider or its licensors. Nothing in these Terms transfers intellectual property rights to the Customer except for the limited right of use expressly granted. The Customer must not remove copyright, trademark or proprietary notices. The Provider will not publish the Customer\'s name, trademark or logo as a customer reference or promotional material without the Customer\'s separate prior consent.'}</P>

        <H3>{sl ? '7. člen – Lastništvo Uporabniških podatkov' : 'Article 7 – Ownership of Customer Data'}</H3>
        <P>{sl
          ? 'Vse pravice na Uporabniških podatkih ostanejo Naročniku oziroma njihovim zakonitim imetnikom. Ponudnik ne pridobi lastništva nad ceniki, kupci, dobavitelji, predkalkulacijami, ponudbami, proizvodnimi parametri, tehnično dokumentacijo ali drugimi poslovnimi podatki Naročnika. Naročnik Ponudniku podeljuje zgolj omejeno pravico obdelave Uporabniških podatkov, ki je potrebna za gostovanje, prikazovanje, prenos, varnostno obdelavo, podporo in zagotavljanje funkcionalnosti Storitev. Naročnik zagotavlja, da ima za podatke, ki jih vnese v Storitev, potrebne pravice in pravne podlage.'
          : 'All rights in Customer Data remain with the Customer or their lawful owners. The Provider does not acquire ownership of customer lists, supplier lists, quotes, cost estimates, manufacturing parameters, technical documentation or other business data. The Customer grants the Provider only the limited processing rights necessary to host, display, transmit, secure, support and provide the functionality of the Service. The Customer represents that it has the rights and lawful bases required for data it submits.'}</P>
        <P>{sl
          ? 'Toolingdesk sam ne uporablja Uporabniških podatkov za treniranje modelov umetne inteligence in Uporabniških podatkov namensko ne pošilja ponudnikom AI zaradi treniranja modelov. Ponudnik ne uporablja Supabase AI orodij ali Vercel AI produktov za vsebino Uporabniških podatkov kot del običajnega delovanja Toolingdesk.'
          : 'Toolingdesk itself does not use Customer Data to train artificial-intelligence models and does not intentionally send Customer Data to AI providers for model training. The Provider does not use Supabase AI tools or Vercel AI products on Customer Data as part of Toolingdesk\'s ordinary operation.'}</P>

        <H3>{sl ? '8. člen – Zaupnost in poslovne skrivnosti' : 'Article 8 – Confidentiality and trade secrets'}</H3>
        <P>{sl
          ? 'Vsaka pogodbenica mora varovati zaupne informacije druge pogodbenice. Za zaupne informacije Naročnika se štejejo zlasti Proizvodni podatki, Tehnična dokumentacija, podatki o kupcih in dobaviteljih, cene, stroški, marže, urne postavke, proizvodni časi, komercialni pogoji, ponudbe, kalkulacije, tehnološki postopki in poslovni načrti.'
          : 'Each party must protect the other party\'s Confidential Information obtained in connection with the Service. Customer Confidential Information includes in particular Manufacturing Data, Technical Documentation, customer and supplier information, prices, costs, margins, hourly rates, production times, commercial terms, quotes, calculations, manufacturing processes and business plans.'}</P>
        <P>{sl
          ? 'Zaupne informacije se smejo uporabiti samo za izvajanje razmerja po teh Pogojih in razkriti le osebam, ki jih potrebujejo za ta namen. Obveznost zaupnosti ne velja za informacije, ki so zakonito javno znane, so bile prejemniku zakonito znane že pred razkritjem, so bile neodvisno razvite ali zakonito pridobljene od tretje osebe brez obveznosti zaupnosti.'
          : 'Confidential Information may be used only to perform the relationship under these Terms and disclosed only to persons who need it for that purpose and are subject to appropriate confidentiality obligations. Confidentiality obligations do not apply to information lawfully public, lawfully known before disclosure, independently developed or lawfully received from a third party without confidentiality restriction.'}</P>
        <P>{sl
          ? 'Ponudnik v okviru standardne ali brezplačne beta uporabe ni dolžan podpisati ločenega NDA, individualne pogodbe o zaupnosti ali naročnikovega obrazca. Če Naročnik za posamezne podatke potrebuje posebno pogodbeno raven zaupnosti ali individualen NDA, takih podatkov ne sme naložiti, dokler s Ponudnikom ni sklenjen ločen pisni dogovor.'
          : 'As part of the standard or free beta offering, the Provider is not required to sign a separate NDA, bespoke confidentiality agreement or Customer form. If the Customer requires a specific contractual confidentiality standard or individual NDA for particular information, it must not upload that information unless a separate written agreement has first been entered into with the Provider.'}</P>

        {/* ── IV. ── */}
        <H2>{sl ? 'IV. PREDKALKULACIJE, PONUDBE IN ODGOVORNOST UPORABNIKA' : 'IV. COST ESTIMATES, QUOTES AND CUSTOMER RESPONSIBILITY'}</H2>

        <H3>{sl ? '9. člen – Narava izračunov in rezultatov' : 'Article 9 – Nature of calculations and outputs'}</H3>
        <P>{sl
          ? 'Toolingdesk je programsko orodje za pomoč pri pripravi predkalkulacij, ocen stroškov in ponudb v proizvodnem okolju. Rezultati so odvisni od vhodnih podatkov, nastavitev, formul, predpostavk, konfiguracije in načina uporabe Storitev. Ponudnik ne jamči, da posamezna Predkalkulacija ali Ponudba predstavlja dejanski končni strošek izdelave, dejanski proizvodni čas, tržno ceno, optimalno ceno ali ekonomsko donosnost posameznega posla. Rezultati ne predstavljajo strokovnega, računovodskega, davčnega, pravnega, inženirskega ali drugega reguliranega svetovanja. Avtomatski izračun ne nadomešča strokovne presoje tehnologa, kalkulanta, komercialista, vodje proizvodnje ali druge ustrezno usposobljene osebe.'
          : 'Toolingdesk is a software tool assisting with cost estimates, cost calculations and quotation preparation in manufacturing environments. Outputs depend on inputs, settings, formulas, assumptions, configuration and the manner in which the Service is used. The Provider does not warrant that a Cost Estimate or Quote represents the actual final manufacturing cost, actual production time, market price, optimal price or profitability of a particular job. Outputs do not constitute legal, tax, accounting, engineering or other regulated professional advice. Automated calculations do not replace the professional judgment of a technologist, estimator, sales professional, production manager or other appropriately qualified person.'}</P>

        <H3>{sl ? '10. člen – Preverjanje pred uporabo' : 'Article 10 – Verification before use'}</H3>
        <P>{sl
          ? 'Naročnik je odgovoren za pravilnost in popolnost vnesenih podatkov, vključno s cenami materialov, strojnimi postavkami, stroški dela, časi operacij, stroški orodij, režijskimi stroški, maržami, popusti, davčnimi nastavitvami in drugimi vhodnimi podatki. Naročnik mora pred pošiljanjem Ponudbe tretji osebi preveriti vse bistvene izračune in komercialne podatke. Ponudnik ne odgovarja za posledice, ki izvirajo iz nepreverjenih, napačnih, zastarelih ali nepopolnih vhodnih podatkov. Naročnik je odgovoren za končno vsebino in pravno zavezujočnost ponudb, ki jih pošlje svojim kupcem.'
          : 'The Customer is responsible for the accuracy and completeness of inputs, including material prices, machine rates, labour costs, operation times, tooling costs, overhead, margins, discounts, tax settings and other data. Before sending a Quote to a third party, the Customer must verify all material calculations and commercial information. The Provider is not responsible for consequences resulting from unverified, incorrect, outdated or incomplete input data. The Customer is solely responsible for the final content and legal effect of quotes sent to its customers.'}</P>

        {/* ── V. ── */}
        <H2>{sl ? 'V. BETA RAZLIČICA, RAZVOJ IN PODPORA' : 'V. BETA SERVICE, DEVELOPMENT AND SUPPORT'}</H2>

        <H3>{sl ? '11. člen – Beta različica' : 'Article 11 – Beta status'}</H3>
        <P>{sl
          ? 'Toolingdesk je v trenutni fazi brezplačna beta različica. Ponudnik namerava tudi po koncu beta obdobja ohraniti vsaj en brezplačen paket, vendar lahko njegov obseg, omejitve, kvote in vključene funkcionalnosti kadarkoli spremeni v skladu s temi Pogoji. Beta različica je lahko nepopolna, vsebuje napake, nedokončane funkcionalnosti ali začasno drugačno uporabniško izkušnjo od kasnejše komercialne različice. Funkcionalnosti se lahko brez predhodnega obvestila dodajo, spremenijo, omejijo ali odstranijo. Ponudnik ne jamči neprekinjenega delovanja Beta Storitev, določenega odzivnega časa, SLA ali minimalnega odstotka razpoložljivosti.'
          : 'Toolingdesk is currently provided as a free beta version. The Provider currently intends to retain at least one free plan after the beta period, but may change its scope, limits, quotas and included features in accordance with these Terms. The Beta Service may be incomplete, contain bugs, unfinished features or an experience different from a future commercial version. Features may be added, changed, restricted or removed. No specific uptime, response time, SLA or minimum availability percentage is guaranteed during beta.'}</P>

        <H3>{sl ? '12. člen – Podpora' : 'Article 12 – Support'}</H3>
        <P>{sl
          ? 'Ponudnik si bo prizadeval nuditi osnovno podporo prek objavljenih kontaktnih kanalov, zlasti prek info@bimetric.si. V beta obdobju ni zagotovljen določen odzivni čas ali čas odprave napake. Predlog funkcionalnosti, prijava napake ali zahtevek za podporo ne ustvarja obveznosti, da bo Ponudnik zahtevano funkcionalnost razvil ali napako odpravil v določenem roku.'
          : 'The Provider will use reasonable efforts to provide basic support through published contact channels, including info@bimetric.si. No guaranteed response or resolution time applies during beta. A feature request, bug report or support request does not create an obligation to implement or resolve it within a particular timeframe.'}</P>

        <H3>{sl ? '13. člen – Napake in vzdrževanje' : 'Article 13 – Defects and maintenance'}</H3>
        <P>{sl
          ? 'Ponudnik lahko izvaja redno ali izredno vzdrževanje, nadgradnje in varnostne posege. Kadar je razumno mogoče, lahko Ponudnik o načrtovanih večjih prekinitvah obvesti Uporabnike vnaprej. Kritične napake, ki preprečujejo običajno uporabo Storitev ali pomenijo varnostno tveganje, imajo praviloma prednost, vendar tudi zanje v beta obdobju ni zagotovljen pogodbeni rok odprave.'
          : 'The Provider may perform regular or emergency maintenance, upgrades and security work. Where reasonably possible, material planned interruptions may be notified in advance. Critical defects affecting ordinary use or security will generally receive priority, but no contractual remediation time applies during beta.'}</P>

        <H3>{sl ? '14. člen – Spremembe Storitev' : 'Article 14 – Changes to the Service'}</H3>
        <P>{sl
          ? 'Ponudnik lahko razvija, spreminja, nadomešča ali ukinja posamezne funkcionalnosti. Ponudnik si bo pri bistvenih spremembah, ki znatno vplivajo na običajno uporabo Storitev, prizadeval zagotoviti razumno predhodno obvestilo, kadar je to izvedljivo. Naročnik ni upravičen do ohranitve posamezne beta funkcionalnosti v nespremenjeni obliki.'
          : 'The Provider may develop, modify, replace or discontinue features. Where a material change substantially affects ordinary use, the Provider will use reasonable efforts to give advance notice where practicable. The Customer is not entitled to continued availability of any beta feature in unchanged form.'}</P>

        {/* ── VI. ── */}
        <H2>{sl ? 'VI. RAZPOLOŽLJIVOST, INFRASTRUKTURA IN VARNOST' : 'VI. AVAILABILITY, INFRASTRUCTURE AND SECURITY'}</H2>

        <H3>{sl ? '15. člen – Razpoložljivost' : 'Article 15 – Availability'}</H3>
        <P>{sl
          ? 'Ponudnik si prizadeva zagotavljati razumno razpoložljivost Storitev, vendar ne zagotavlja neprekinjenega ali brezhibnega delovanja. Storitev je lahko začasno nedostopna zaradi vzdrževanja, napak, kibernetskih incidentov, težav ponudnikov infrastrukture, internetnih povezav, višje sile ali drugih okoliščin. V brezplačni beta fazi se ne uporablja pogodbeni SLA, razen če je z Naročnikom pisno dogovorjeno drugače.'
          : 'The Provider seeks to maintain reasonable availability but does not guarantee uninterrupted or error-free operation. The Service may be unavailable due to maintenance, defects, cybersecurity incidents, infrastructure-provider failures, internet issues, force majeure or other circumstances. No contractual SLA applies during the free beta unless agreed in writing.'}</P>

        <H3>{sl ? '16. člen – Tehnična infrastruktura, hramba datotek in lokacija obdelave' : 'Article 16 – Technical infrastructure, file storage and processing location'}</H3>
        <P>{sl
          ? 'Toolingdesk uporablja zunanje ponudnike infrastrukture in programske platforme. Za gostovanje, izvajanje in dostavo spletne aplikacije Ponudnik uporablja Vercel (Vercel Inc., Delaware corporation, 440 N Barranca Ave #4133, Covina, CA 91723, USA). Za PostgreSQL podatkovno bazo, avtentikacijo, shranjevanje datotek in povezane backend storitve Ponudnik uporablja Supabase (SUPABASE PTE. LTD., 65 Chulia Street #38-02/03, OCBC Centre, Singapore 049513, Singapore).'
          : 'Toolingdesk relies on external infrastructure and software-platform providers. Web application hosting, execution and delivery are provided through Vercel (Vercel Inc., a Delaware corporation, 440 N Barranca Ave #4133, Covina, CA 91723, United States). PostgreSQL database, authentication, file storage and related backend services are provided through Supabase (SUPABASE PTE. LTD., 65 Chulia Street #38-02/03, OCBC Centre, Singapore 049513, Singapore).'}</P>
        <P>{sl
          ? 'Toolingdesk ne daje izjave, da se vsi podatki hranijo izključno v Sloveniji ali izključno v EGP, ker natančna primarna regija Supabase projekta ni javno razvidna iz pogojev ponudnika. Supabase in Vercel za mednarodne prenose, kjer je to potrebno, vključujeta standardne pogodbene klavzule Evropske komisije v svoja DPA.'
          : 'Toolingdesk does not represent that all data is stored exclusively in Slovenia or exclusively in the EEA, as the exact primary region of the Supabase project is not publicly determinable from provider terms alone. Supabase and Vercel incorporate European Commission Standard Contractual Clauses in their DPAs where required for international transfers.'}</P>

        <H3>{sl ? '17. člen – Varnost informacij' : 'Article 17 – Information security'}</H3>
        <P>{sl
          ? 'Ponudnik izvaja razumne tehnične in organizacijske ukrepe glede na naravo Storitev, razpoložljive tehnologije, stroške izvajanja in tveganja. Ukrepi lahko vključujejo nadzor dostopa, ločevanje uporabnikov in organizacij, šifriran transport podatkov, upravljanje poverilnic, beleženje dogodkov, posodobitve, omejitve dostopa in uporabo varnostnih funkcij infrastrukturnih ponudnikov. Noben informacijski sistem ni popolnoma varen.'
          : 'The Provider implements reasonable technical and organisational measures taking into account the nature of the Service, available technology, implementation costs and risks. Measures may include access controls, tenant separation, encryption in transit, credential management, logging, updates, least-privilege controls and security features supplied by infrastructure providers. No information system is completely secure.'}</P>

        <H3>{sl ? '18. člen – Varnostne kopije in obnova' : 'Article 18 – Backups and recovery'}</H3>
        <P>{sl
          ? 'Ponudnik trenutno uporablja Supabase Free načrt. Po javno objavljenih podatkih Supabase samodejne varnostne kopije podatkovne baze na Free načrtu niso vključene. Ponudnik zato ne zagotavlja obnovitve podatkov iz backupa, point-in-time recovery ali določenega obdobja hrambe varnostnih kopij. Naročnik je odgovoren, da poslovno kritične podatke in izvorno tehnično dokumentacijo po potrebi hrani tudi v lastnih sistemih.'
          : 'The Provider currently uses the Supabase Free plan. According to Supabase\'s current published plan information, automatic database backups are not included in the Free plan. The Provider therefore does not guarantee backup restoration, point-in-time recovery or any defined backup-retention period. The Customer remains responsible for retaining business-critical data and original technical documentation in its own systems where appropriate.'}</P>

        {/* ── VII. ── */}
        <H2>{sl ? 'VII. CENE IN PRIHODNJA KOMERCIALNA UPORABA' : 'VII. PRICING AND FUTURE COMMERCIAL USE'}</H2>

        <H3>{sl ? '20. člen – Brezplačna beta uporaba' : 'Article 20 – Free beta use'}</H3>
        <P>{sl
          ? 'Toolingdesk je v času objave teh Pogojev na voljo brezplačno kot beta različica, razen če je posameznemu Naročniku pisno sporočeno drugače. Ponudnik trenutno namerava tudi po beta obdobju ohraniti brezplačen paket, vendar to ne pomeni pravice do nespremenjenega ali neomejenega brezplačnega paketa za nedoločen čas. Ponudnik lahko v prihodnje uvede dodatne plačljive pakete, omejitve uporabe, kvote, dodatne funkcionalnosti ali druge komercialne modele.'
          : 'At the date of these Terms, Toolingdesk is available free of charge as a beta unless otherwise expressly communicated to a particular Customer. The Provider currently intends to retain a free plan after beta. This does not create a right to an unchanged or unlimited free plan indefinitely. The Provider may later introduce additional paid plans, quotas, usage limits, premium functionality or other commercial models.'}</P>

        <H3>{sl ? '21. člen – Uvedba plačljivih paketov' : 'Article 21 – Introduction of paid plans'}</H3>
        <P>{sl
          ? 'Brez izrecnega sprejema plačljivega paketa Naročniku ne bo avtomatično zaračunan nov naročniški strošek samo zato, ker je prej uporabljal brezplačno beta različico. Plačljivi pogoji, cene, obračunsko obdobje, davki, način odpovedi in drugi bistveni komercialni pogoji bodo Naročniku predstavljeni pred sklenitvijo plačljivega razmerja.'
          : 'A Customer will not automatically be charged a new subscription merely because it previously used the free beta. Paid use requires a separate acceptance or ordering step. Pricing, billing cycles, taxes, cancellation rules and other material commercial terms will be presented before a paid relationship is entered into.'}</P>

        {/* ── VIII. ── */}
        <H2>{sl ? 'VIII. OMEJITEV, PRENEHANJE IN IZBRIS RAČUNA' : 'VIII. SUSPENSION, TERMINATION AND ACCOUNT DELETION'}</H2>

        <H3>{sl ? '22. člen – Začasna omejitev dostopa' : 'Article 22 – Temporary suspension'}</H3>
        <P>{sl ? 'Ponudnik lahko začasno omeji ali suspendira dostop, če je to razumno potrebno zaradi:' : 'The Provider may temporarily restrict or suspend access where reasonably necessary because of:'}</P>
        <Ul items={sl ? [
          'varnostnega incidenta ali grožnje;',
          'suma zlorabe ali nezakonite uporabe;',
          'kršitve teh Pogojev;',
          'potrebe po zaščiti drugih uporabnikov ali infrastrukture;',
          'zahteve pristojnega organa;',
          'prenehanja ali omejitve ključne tretje storitve.',
        ] : [
          'a security incident or threat;',
          'suspected misuse or unlawful activity;',
          'a breach of these Terms;',
          'the need to protect other users or infrastructure;',
          'a requirement of a competent authority;',
          'suspension or termination of a critical third-party service.',
        ]} />

        <H3>{sl ? '23. člen – Odpoved s strani Naročnika' : 'Article 23 – Termination by Customer'}</H3>
        <P>{sl
          ? 'Naročnik lahko preneha uporabljati Storitev kadarkoli. Zahtevo za izbris Računa je mogoče poslati na info@bimetric.si. Po potrjeni zahtevi bo Ponudnik podatke iz aktivnih sistemov izbrisal oziroma anonimiziral brez nepotrebnega odlašanja in praviloma najpozneje v 30 dneh, razen kadar daljšo hrambo zahteva zakon ali reševanje varnostnega incidenta.'
          : 'The Customer may stop using the Service at any time. A request may be sent to info@bimetric.si. Following a confirmed account-closure request, the Provider will delete or anonymise data from active systems without undue delay and generally no later than 30 days, except where longer retention is required by law or necessary to address a security incident.'}</P>

        <H3>{sl ? '24. člen – Prenehanje s strani Ponudnika' : 'Article 24 – Termination by Provider'}</H3>
        <P>{sl
          ? 'Ponudnik lahko brezplačno beta Storitev ali posamezno funkcionalnost ukine. Če je razumno mogoče in ne gre za nujne varnostne ali pravne razloge, si bo Ponudnik prizadeval zagotoviti razumno predhodno obvestilo. Ponudnik lahko takoj prekine dostop ob hujši kršitvi Pogojev, varnostnem tveganju, nezakoniti uporabi ali ravnanju, ki bistveno ogroža Storitev ali tretje osebe.'
          : 'The Provider may discontinue the free Beta Service or individual features. Where reasonably possible and not prevented by urgent security or legal circumstances, reasonable advance notice will be given. Access may be terminated immediately for material breach, security threats, unlawful use or conduct materially endangering the Service or third parties.'}</P>

        {/* ── IX. ── */}
        <H2>{sl ? 'IX. JAMSTVA IN OMEJITEV ODGOVORNOSTI' : 'IX. WARRANTIES AND LIMITATION OF LIABILITY'}</H2>

        <H3>{sl ? '26. člen – Storitev »kot je«' : 'Article 26 – Service provided "as is"'}</H3>
        <P>{sl
          ? 'V največjem obsegu, ki ga dovoljuje veljavno pravo, je brezplačna beta Storitev zagotovljena »kot je« in »kot je na voljo«. Ponudnik ne jamči, da bo Storitev vedno brez napak, neprekinjena, popolnoma varna, združljiva z vsemi sistemi ali primerna za vsak posamezen poslovni namen. Ponudnik ne jamči, da bodo vsi Rezultati točni, popolni ali primerni za poslovno odločanje brez dodatnega preverjanja.'
          : 'To the fullest extent permitted by law, the free Beta Service is provided "as is" and "as available". The Provider does not warrant that the Service will always be error-free, uninterrupted, completely secure, compatible with all systems or suitable for every business purpose. The Provider does not warrant that all Outputs will be accurate, complete or suitable for business decision-making without verification.'}</P>

        <H3>{sl ? '27. člen – Posebna izključitev glede kalkulacij in ponudb' : 'Article 27 – Specific disclaimer for estimates and quotes'}</H3>
        <P>{sl
          ? 'Ponudnik ne prevzema odgovornosti za poslovno izgubo, ki nastane izključno zato, ker je Naročnik brez ustreznega strokovnega preverjanja uporabil Rezultat Storitev. To vključuje zlasti napačno določeno ponudbeno ceno, napačno oceno materiala, strojnega časa, dela, orodij, režije, marže ali drugih proizvodnih in komercialnih parametrov. Naročnik mora pred uporabo Rezultatov pri zavezujočih poslovnih odločitvah izvesti lastno strokovno kontrolo.'
          : 'The Provider is not responsible for business losses arising solely because the Customer relied on an Output without appropriate professional verification. This includes incorrect quote prices, material assumptions, machine time, labour, tooling, overhead, margin or other manufacturing and commercial parameters. The Customer must perform its own professional review before using Outputs for binding business decisions.'}</P>

        <H3>{sl ? '28. člen – Splošna omejitev odgovornosti' : 'Article 28 – General limitation of liability'}</H3>
        <P>{sl
          ? 'V največjem obsegu, ki ga dovoljuje veljavno pravo, Ponudnik ne odgovarja za posredno, posledično ali posebno škodo, izgubljeni dobiček, izgubljeni prihodek, izgubljeno poslovno priložnost, izgubo ugleda ali prekinitev poslovanja. Ker je Storitev trenutno brezplačna beta različica, je skupna pogodbena odgovornost Ponudnika omejena na 100 EUR na posameznega Naročnika za vse zahtevke skupaj v kateremkoli zaporednem 12-mesečnem obdobju. Prejšnja omejitev se ne uporablja, kadar odgovornosti po veljavnem pravu ni dopustno omejiti ali izključiti, zlasti pri škodi, povzročeni namenoma ali iz hude malomarnosti.'
          : 'To the fullest extent permitted by applicable law, the Provider is not liable for indirect, consequential or special loss, lost profits, lost revenue, lost business opportunity, loss of reputation or business interruption. Because the Service is currently a free beta, the Provider\'s aggregate contractual liability is capped at EUR 100 per Customer for all claims in any consecutive 12-month period. These limitations do not apply where liability may not lawfully be excluded or limited, including intentional misconduct or gross negligence where mandatory law so provides.'}</P>

        <H3>{sl ? '29. člen – Višja sila' : 'Article 29 – Force majeure'}</H3>
        <P>{sl
          ? 'Ponudnik ne odgovarja za neizpolnitev ali zamudo, ki je posledica dogodkov zunaj njegovega razumnega nadzora, vključno z naravnimi nesrečami, vojnami, stavkami, izpadi elektrike, interneta, globalne infrastrukture, kibernetskimi napadi, epidemijami, ravnanjem državnih organov ali obsežnimi izpadi ponudnikov infrastrukture.'
          : 'The Provider is not liable for failure or delay caused by events beyond its reasonable control, including natural disasters, war, strikes, electricity or internet failures, global infrastructure outages, cyberattacks, epidemics, government action or large-scale failures of infrastructure providers.'}</P>

        {/* ── X. ── */}
        <H2>{sl ? 'X. INTEGRACIJE, UVOZI IN IZVOZI' : 'X. INTEGRATIONS, IMPORTS AND EXPORTS'}</H2>
        <P>{sl
          ? 'Storitev lahko vključuje povezave z izdelki ali storitvami tretjih oseb. Za tretje storitve veljajo njihovi lastni pogoji in politike zasebnosti. Ponudnik ne odgovarja za spremembe, ukinitve, napake ali ravnanje tretjih storitev, ki niso pod njegovim nadzorom. Naročnik je odgovoren za pravilnost uvoženih podatkov ter mora pred prenehanjem uporabe pravočasno izvoziti podatke, ki jih želi ohraniti.'
          : 'The Service may connect to third-party products or services. Third-party services are governed by their own terms and privacy policies. The Provider is not responsible for changes, discontinuation, defects or conduct of third-party services outside its control. The Customer is responsible for the accuracy of imported data and should export data it wishes to retain before terminating use.'}</P>

        {/* ── XI. ── */}
        <H2>{sl ? 'XI. VARSTVO OSEBNIH PODATKOV' : 'XI. PERSONAL DATA'}</H2>

        <H3>{sl ? '32. člen – Vloge po GDPR' : 'Article 32 – GDPR roles'}</H3>
        <P>{sl
          ? 'Za osebne podatke, ki jih Ponudnik zbira za upravljanje računov, varnost Storitev, komunikacijo z uporabniki in podporo, Ponudnik praviloma nastopa kot samostojni upravljavec. Za osebne podatke, ki jih Naročnik vnese v Toolingdesk v okviru lastnega poslovanja, na primer podatke o svojih kupcih, dobaviteljih, kontaktnih osebah ali zaposlenih, Naročnik praviloma nastopa kot upravljavec, Ponudnik pa kot obdelovalec po navodilih Naročnika. Podrobnejše informacije o obdelavi podatkov so določene v Politiki zasebnosti Toolingdesk.'
          : 'For personal data collected by the Provider for account administration, Service security, communications and support, the Provider generally acts as controller. For personal data entered into Toolingdesk by the Customer as part of its own business operations, such as information relating to the Customer\'s customers, suppliers, contacts or employees, the Customer generally acts as controller and the Provider acts as processor on the Customer\'s documented instructions. Processing for which the Provider acts as controller is described further in the Toolingdesk Privacy Policy.'}</P>

        {/* ── XII. DPA ── */}
        <H2>{sl ? 'XII. DOGOVOR O OBDELAVI OSEBNIH PODATKOV (DPA)' : 'XII. DATA PROCESSING AGREEMENT'}</H2>
        <P>{sl
          ? 'To poglavje predstavlja dogovor o obdelavi osebnih podatkov v smislu 28. člena GDPR, kadar Ponudnik za Naročnika obdeluje osebne podatke kot obdelovalec. Predmet obdelave je zagotavljanje Storitev Toolingdesk, vključno z gostovanjem podatkov, shranjevanjem, prikazovanjem, prenosom, avtentikacijo in podporo.'
          : 'This Chapter constitutes a data processing agreement within the meaning of Article 28 GDPR where the Provider processes personal data on behalf of the Customer. The subject matter is the provision of Toolingdesk, including hosting, storage, display, transmission, authentication, support, security, calculations and related functions selected by the Customer.'}</P>

        <H3>{sl ? 'Kategorije posameznikov in podatkov (34. člen)' : 'Data subjects and categories of data (Article 34)'}</H3>
        <P>{sl ? 'Kategorije posameznikov lahko vključujejo:' : 'Data subjects may include:'}</P>
        <Ul items={sl ? [
          'zaposlene, sodelavce in Uporabnike Naročnika;',
          'kontaktne osebe pri kupcih in dobaviteljih;',
          'poslovne partnerje, potencialne stranke in druge osebe, katerih podatke Naročnik vnese v Storitev.',
        ] : [
          'employees, contractors and Users of the Customer;',
          'contacts at customers and suppliers;',
          'business partners, prospects and other persons whose details the Customer submits.',
        ]} />
        <P>{sl ? 'Vrste podatkov lahko vključujejo ime in priimek, poslovni e-poštni naslov in telefonsko številko, naziv podjetja, funkcijo ter vsebino ponudb, opomb in poslovne komunikacije. Toolingdesk ni namenjen shranjevanju posebnih vrst osebnih podatkov iz 9. člena GDPR.'
          : 'Personal data may include name, business email address and phone number, employer and role, and content of quotes, notes and business communications. Toolingdesk is not intended for special-category data under Article 9 GDPR unless expressly supported and separately agreed.'}</P>

        <H3>{sl ? 'Podobdelovalci (38. člen)' : 'Subprocessors (Article 38)'}</H3>
        <P>{sl ? 'Naročnik daje Ponudniku splošno dovoljenje za uporabo podobdelovalcev, potrebnih za zagotavljanje Storitev. Ključna podobdelovalca sta trenutno:' : 'The Customer grants general authorisation for the Provider to engage subprocessors needed to provide the Service. Current key subprocessors include:'}</P>
        <Table
          headers={sl ? ['Ponudnik', 'Pravna oseba', 'Funkcija'] : ['Provider', 'Legal entity', 'Function']}
          rows={[
            ['Supabase', 'SUPABASE PTE. LTD., 65 Chulia Street #38-02/03, OCBC Centre, Singapore 049513, Singapore', sl ? 'Podatkovna baza, avtentikacija in povezane backend storitve' : 'Database, authentication and related backend services'],
            ['Vercel', 'Vercel Inc., Delaware corporation, 440 N Barranca Ave #4133, Covina, CA 91723, USA', sl ? 'Gostovanje, izvajanje in dostava spletne aplikacije' : 'Hosting, execution and delivery of the web application'],
          ]}
        />
        <P>{sl
          ? 'Ponudnik bo Naročnika razumno obvestil pred morebitno spremembo ali dodajanjem novih podobdelovalcev, kadar sprememba lahko pomembno vpliva na varstvo osebnih podatkov.'
          : 'The Provider will use reasonable efforts to notify the Customer before adding or replacing subprocessors where the change may materially affect personal-data protection.'}</P>

        <H3>{sl ? 'Mednarodni prenosi (39. člen)' : 'International transfers (Article 39)'}</H3>
        <P>{sl
          ? 'Ker sta Supabase in Vercel mednarodna ponudnika infrastrukture, lahko pri uporabi Toolingdesk pride do mednarodnih prenosov osebnih podatkov. Kadar GDPR zahteva poseben mehanizem za prenos, se uporabljajo ustrezni pravni mehanizmi, kot so sklep o ustreznosti ali standardne pogodbene klavzule Evropske komisije.'
          : 'Because Supabase and Vercel are international infrastructure providers, use of Toolingdesk may involve international transfers of personal data. Where GDPR requires a transfer mechanism, appropriate lawful mechanisms such as adequacy decisions or European Commission Standard Contractual Clauses will apply.'}</P>

        <H3>{sl ? 'Kršitev varnosti (42. člen)' : 'Personal-data breaches (Article 42)'}</H3>
        <P>{sl
          ? 'Če Ponudnik ugotovi kršitev varnosti osebnih podatkov, ki jih obdeluje v imenu Naročnika, bo Naročnika obvestil brez nepotrebnega odlašanja po tem, ko je s kršitvijo seznanjen. Obvestilo bo vsebovalo informacije, ki so Ponudniku takrat na voljo in jih Naročnik potrebuje za izpolnjevanje svojih obveznosti.'
          : 'If the Provider becomes aware of a personal-data breach affecting data processed on behalf of the Customer, the Provider will notify the Customer without undue delay. The notification will include, to the extent reasonably available, information needed by the Customer to comply with its legal obligations.'}</P>

        <H3>{sl ? 'Izbris in vrnitev podatkov (44. člen)' : 'Return and deletion (Article 44)'}</H3>
        <P>{sl
          ? 'Po prenehanju obdelave oziroma potrjenem zaprtju Računa bo Ponudnik osebne podatke iz aktivnih sistemov izbrisal oziroma anonimiziral brez nepotrebnega odlašanja in praviloma najpozneje v 30 dneh, razen če zakon zahteva nadaljnjo hrambo.'
          : 'Following termination or confirmed Account closure, the Provider will delete or anonymise personal data from active systems without undue delay and generally within 30 days, unless retention is required by law.'}</P>

        {/* ── XIII. ── */}
        <H2>{sl ? 'XIII. POLITIKA ZASEBNOSTI IN PIŠKOTKI' : 'XIII. PRIVACY AND COOKIES'}</H2>
        <P>{sl
          ? 'Obdelava osebnih podatkov, pri kateri Ponudnik nastopa kot upravljavec, je podrobneje opisana v ločeni Politiki zasebnosti Toolingdesk. Toolingdesk lahko uporablja nujno potrebne piškotke ali podobne tehnologije za prijavo, varnost, shranjevanje seje in osnovno delovanje. Toolingdesk trenutno ne uporablja neobveznega spletnega analytics sistema, session replay sistema ali namenskega error-monitoring ponudnika za sledenje vedenju končnih uporabnikov.'
          : 'Processing for which the Provider acts as controller is described in the separate Toolingdesk Privacy Policy. Toolingdesk may use strictly necessary cookies or similar technologies for login, security, session storage and core operation. Toolingdesk currently does not use an optional web-analytics system, session-replay system or dedicated error-monitoring provider to track end-user behaviour.'}</P>

        {/* ── XIV. ── */}
        <H2>{sl ? 'XIV. ODGOVORNOST NAROČNIKA IN ZAHTEVKI TRETJIH OSEB' : 'XIV. CUSTOMER RESPONSIBILITY AND THIRD-PARTY CLAIMS'}</H2>
        <P>{sl
          ? 'Naročnik je odgovoren za zakonitost podatkov, ki jih vnese v Storitev, ter za to, da ima za obdelavo in posredovanje podatkov ustrezno pravno podlago. Naročnik ne sme uporabljati Storitev na način, ki krši pravice intelektualne lastnine, zaupnost, varstvo osebnih podatkov, poslovne skrivnosti ali druge pravice tretjih oseb. Če proti Ponudniku nastane zahtevek tretje osebe, ki neposredno izvira iz nezakonitih Uporabniških podatkov ali nezakonite uporabe Storitev s strani Naročnika, mora Naročnik s Ponudnikom razumno sodelovati pri obrambi in odpravi kršitve.'
          : 'The Customer is responsible for the legality of data it submits and for having an appropriate lawful basis for processing and sharing that data. The Customer must not use the Service in a manner that infringes intellectual property, confidentiality, privacy, trade-secret or other rights of third parties. If a third-party claim against the Provider arises directly from unlawful Customer Data or manifestly unlawful use by the Customer, the Customer must reasonably cooperate with the Provider in defending and remediating the matter.'}</P>

        {/* ── XV. ── */}
        <H2>{sl ? 'XV. KOMUNIKACIJA IN SPREMEMBE' : 'XV. COMMUNICATIONS AND CHANGES'}</H2>
        <P>{sl
          ? 'Ponudnik lahko Naročniku pošilja obvestila prek e-pošte, znotraj Storitev ali z objavo na spletni strani. Naročnik je odgovoren, da so njegovi kontaktni podatki ažurni. Kontakt Ponudnika za običajna vprašanja je info@bimetric.si.'
          : 'The Provider may send notices by email, through the Service or by publication on the website. The Customer is responsible for keeping contact details current. The Provider\'s general contact is info@bimetric.si.'}</P>
        <P>{sl
          ? 'Ponudnik lahko Pogoje spremeni zaradi razvoja Storitev, sprememb zakonodaje, varnosti, poslovnega modela ali drugih utemeljenih razlogov. Pri bistvenih spremembah bo Ponudnik uporabnike obvestil v razumnem roku pred začetkom veljavnosti. Če se Naročnik z bistveno spremembo ne strinja, lahko preneha uporabljati Storitev in zahteva izbris Računa.'
          : 'The Provider may amend these Terms due to Service development, changes in law, security, business model or other legitimate reasons. Material changes will be notified within a reasonable period before taking effect where practicable. If the Customer does not accept a material change, it may stop using the Service and request Account deletion.'}</P>
        <P>{sl
          ? 'Ponudnik lahko v prihodnje prenese upravljanje, razvoj ali zagotavljanje Toolingdesk na novo ustanovljeno ali drugo povezano pravno osebo, če je tak prenos zakonit. Naročnik ne sme prenesti svojih pravic iz teh Pogojev na tretjo osebo brez predhodnega soglasja Ponudnika.'
          : 'The Provider may in future transfer the operation, development or provision of Toolingdesk to a newly established or other affiliated legal entity where lawful. The Customer may not assign its rights under these Terms without prior consent.'}</P>

        {/* ── XVI. ── */}
        <H2>{sl ? 'XVI. KONČNE DOLOČBE' : 'XVI. FINAL PROVISIONS'}</H2>
        <P>{sl
          ? 'Ti Pogoji skupaj z morebitnim DPA, Politiko zasebnosti in izrecno dogovorjenimi individualnimi pogoji predstavljajo dogovor glede uporabe Storitev. Če je katera določba neveljavna ali neizvršljiva, ostale določbe ostanejo v veljavi.'
          : 'These Terms, together with any applicable DPA, Privacy Policy and expressly agreed individual terms, form the agreement governing use of the Service. If a provision is invalid or unenforceable, the remaining provisions remain effective.'}</P>
        <P>{sl
          ? 'Za te Pogoje se uporablja pravo Republike Slovenije. Za vprašanja, ki niso posebej urejena, se uporabljajo veljavni predpisi Republike Slovenije in neposredno uporabljivi predpisi Evropske unije.'
          : 'These Terms are governed by the laws of the Republic of Slovenia. Matters not expressly addressed are governed by applicable Slovenian law and directly applicable European Union law.'}</P>
        <P>{sl
          ? 'Stranki si bosta prizadevali morebitni spor najprej rešiti sporazumno. Če sporazumna rešitev ni mogoča, je za spore dogovorjeno stvarno pristojno sodišče v Ljubljani, Republika Slovenija, kolikor je tak dogovor o krajevni pristojnosti po veljavnem pravu dopusten.'
          : 'The parties will first attempt to resolve disputes amicably. If no amicable resolution is reached, the parties agree to the competent court in Ljubljana, Republic of Slovenia, to the extent that such choice of territorial jurisdiction is permitted by applicable law.'}</P>
        <P>{sl
          ? 'Pogoji so lahko objavljeni v slovenskem in angleškem jeziku. V primeru vsebinskega neskladja med različicama ima za razmerje, ki se presoja po slovenskem pravu, prednost slovenska različica.'
          : 'These Terms may be published in Slovenian and English. In case of inconsistency, the Slovenian version prevails for relationships governed by Slovenian law unless expressly agreed otherwise.'}</P>

        {/* ── Annexes ── */}
        <H2>{sl ? 'PRILOGA 1 – PODOBDELOVALCI IN INFRASTRUKTURNI PONUDNIKI' : 'SCHEDULE 1 – SUBPROCESSORS AND INFRASTRUCTURE PROVIDERS'}</H2>
        <Table
          headers={sl ? ['Ponudnik', 'Pravna oseba in naslov', 'Namen'] : ['Provider', 'Legal entity and address', 'Purpose']}
          rows={[
            ['Supabase', 'SUPABASE PTE. LTD., 65 Chulia Street #38-02/03, OCBC Centre, Singapore 049513, Singapore', sl ? 'PostgreSQL podatkovna baza, avtentikacija in povezane backend storitve' : 'PostgreSQL database, authentication and related backend services'],
            ['Vercel', 'Vercel Inc., Delaware corporation, 440 N Barranca Ave #4133, Covina, CA 91723, USA', sl ? 'Gostovanje, izvajanje in globalna dostava spletne aplikacije' : 'Hosting, execution and global delivery of the web application'],
          ]}
        />
        <P className="text-sm text-gray-400">{sl
          ? 'Seznam se lahko spremeni, če Ponudnik spremeni infrastrukturo ali doda dodatne ponudnike.'
          : 'This list may change if the Provider changes infrastructure or adds additional providers.'}</P>

        <H2>{sl ? 'PRILOGA 2 – POVZETEK TEHNIČNIH IN ORGANIZACIJSKIH UKREPOV' : 'SCHEDULE 2 – SUMMARY OF TECHNICAL AND ORGANISATIONAL MEASURES'}</H2>
        <Ul items={sl ? [
          'avtentikacija in nadzor dostopa;',
          'ločevanje dostopa med različnimi uporabniki oziroma organizacijami;',
          'HTTPS/TLS za prenos podatkov;',
          'varno upravljanje skrivnosti in servisnih ključev;',
          'omejen administratorski dostop;',
          'uporaba varnostnih funkcij Supabase in Vercel;',
          'posodobitve aplikacijske kode in odvisnosti;',
          'spremljanje napak in relevantnih varnostnih dogodkov, kjer je tehnično omogočeno;',
          'varnostno kopiranje v obsegu, ki ga omogoča uporabljena infrastruktura;',
          'postopki za odziv na varnostne incidente;',
          'načelo najmanjših potrebnih pravic;',
          'periodičen pregled dostopov in konfiguracije, ko se ekipa in obseg Storitev povečujeta.',
        ] : [
          'authentication and access control;',
          'separation of access between different users or organisations;',
          'HTTPS/TLS for data transmission;',
          'secure management of secrets and service keys;',
          'restricted administrative access;',
          'use of Supabase and Vercel security controls;',
          'updates of application code and dependencies;',
          'monitoring of errors and relevant security events where technically enabled;',
          'backups to the extent supported by the infrastructure used;',
          'incident-response procedures;',
          'least-privilege principles;',
          'periodic review of access and configuration as the team and Service scale.',
        ]} />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-400 space-y-1">
          <p><span className="font-medium text-gray-500">{sl ? 'Kontakt:' : 'Contact:'}</span> <a href="mailto:info@bimetric.si" className="text-blue-600 hover:underline">info@bimetric.si</a></p>
          <p><span className="font-medium text-gray-500">{sl ? 'Ponudnik:' : 'Provider:'}</span> Bimetric</p>
          <p><span className="font-medium text-gray-500">{sl ? 'Storitev:' : 'Service:'}</span> Toolingdesk</p>
        </div>
        <div className="mt-6">
          <Link to="/" className="text-sm text-blue-600 hover:underline">{sl ? '← Nazaj na domačo stran' : '← Back to home'}</Link>
        </div>
      </div>
    </div>
  )
}
