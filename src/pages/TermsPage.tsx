import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import AppLogo from '../components/ui/AppLogo'

export default function TermsPage() {
  const { lang, setLang } = useLanguage()
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isSl ? 'Pogoji poslovanja' : 'Terms of Service'}
        </h1>
        <p className="text-gray-400 text-sm mb-10">{isSl ? 'Zadnja posodobitev: julij 2026' : 'Last updated: July 2026'}</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '1. Uvodne doloÄŤbe' : '1. Introduction'}</h2>
            <p>{isSl
              ? 'Z registracijo in uporabo aplikacije Toolingdesk se strinjate s temi pogoji poslovanja v celoti. Pogoji urejajo razmerje med uporabnikom in ponudnikom ter doloÄŤajo pravice in obveznosti obeh strani. ÄŚe se s katerimkoli doloÄŤilom ne strinjate, aplikacije ne smete uporabljati.'
              : 'By registering and using the Toolingdesk application, you agree to these Terms of Service in full. The Terms govern the relationship between the user and the provider and define the rights and obligations of both parties. If you do not agree with any provision, you must not use the application.'}</p>
            <p className="mt-3">{isSl
              ? 'Ponudnik si pridrĹľuje pravico do spremembe teh pogojev. O bistvenih spremembah vas bomo obvestili po e-poĹˇti vsaj 30 dni pred zaÄŤetkom veljavnosti. Nadaljnja uporaba aplikacije po uveljavitvi sprememb pomeni sprejetje novih pogojev.'
              : 'The provider reserves the right to change these Terms. You will be notified of significant changes by email at least 30 days before they take effect. Continued use of the application after changes take effect constitutes acceptance of the new Terms.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '2. Podatki o podjetju' : '2. Company Information'}</h2>
            <p>{isSl
              ? 'Storitev Toolingdesk zagotavlja TCE, d.o.o. Za vsa vpraĹˇanja nas kontaktirajte na '
              : 'The Toolingdesk service is provided by TCE, d.o.o. For any questions, contact us at '}
              <a href="mailto:info@tce.si" className="text-blue-600 hover:underline">info@tce.si</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '3. Registracija in uporabniĹˇki raÄŤun' : '3. Registration and User Account'}</h2>
            <p>{isSl
              ? 'Za uporabo aplikacije Toolingdesk se mora podjetje registrirati. Administrator raÄŤuna je odgovoren za toÄŤnost vnesenih podatkov in za upravljanje dostopov svojih sodelavcev. Vsak uporabnik mora biti stara vsaj 18 let in poslovno sposobna oseba.'
              : 'To use Toolingdesk, a company must register. The account administrator is responsible for the accuracy of entered data and for managing access for their colleagues. Each user must be at least 18 years old and legally capable.'}</p>
            <p className="mt-3">{isSl
              ? 'Uporabnik je odgovoren za varovanje svojega gesla in za vse dejavnosti, ki se izvajajo pod njegovim raÄŤunom. V primeru nepooblaĹˇÄŤenega dostopa je treba ponudnika nemudoma obvestiti.'
              : 'The user is responsible for securing their password and for all activities carried out under their account. In case of unauthorized access, the provider must be notified immediately.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '4. Opis storitve' : '4. Service Description'}</h2>
            <p>{isSl
              ? 'Toolingdesk je spletna aplikacija za upravljanje kalkulacij in ponudb v proizvodnji. Storitev se zagotavlja v obliki SaaS (Software as a Service) in je dostopna prek spletnega brskalnika.'
              : 'Toolingdesk is a web application for managing manufacturing calculations and quotations. The service is provided as Software as a Service (SaaS) and is accessible via a web browser.'}</p>
            <p className="mt-3">{isSl ? 'Storitev med drugim vkljuÄŤuje:' : 'The service includes, among other things:'}</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>{isSl ? 'Upravljanje in kalkulacijo stroĹˇkov (stroji, dela, materiali, reĹľija)' : 'Cost management and calculation (machines, labor, materials, overhead)'}</li>
              <li>{isSl ? 'Ustvarjanje in upravljanje ponudb ter izvoz v PDF' : 'Creating and managing quotations and exporting to PDF'}</li>
              <li>{isSl ? 'Upravljanje strank in sledenje statusom ponudb' : 'Customer management and quotation status tracking'}</li>
              <li>{isSl ? 'Nalaganje in upravljanje priponk (risbe, specifikacije)' : 'Uploading and managing attachments (drawings, specifications)'}</li>
              <li>{isSl ? 'Analitika in pregled prodajne uspeĹˇnosti' : 'Analytics and sales performance overview'}</li>
              <li>{isSl ? 'Upravljanje uporabnikov in dovoljenj v okviru podjetja' : 'User and permission management within the company'}</li>
            </ul>
            <p className="mt-3">{isSl
              ? 'Ponudnik si pridrĹľuje pravico do razvoja, spremembe ali ukinitve posameznih funkcionalnosti. O bistvenih spremembah bo uporabnike obvestil vnaprej.'
              : 'The provider reserves the right to develop, change or discontinue individual features. Users will be notified of significant changes in advance.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '5. Pogoji uporabe storitev' : '5. Acceptable Use'}</h2>
            <p>{isSl
              ? 'Uporabniki se zavezujejo, da bodo storitev uporabljali zakonito in v skladu s temi pogoji. Prepovedano je:'
              : 'Users agree to use the service lawfully and in accordance with these Terms. The following is prohibited:'}</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>{isSl ? 'VnaĹˇanje nezakonitih, neresniÄŤnih ali zavajajoÄŤih vsebin' : 'Entering unlawful, false or misleading content'}</li>
              <li>{isSl ? 'Obhajanje varnostnih mehanizmov ali vdiranje v aplikacijo' : 'Circumventing security mechanisms or hacking the application'}</li>
              <li>{isSl ? 'Deljenje dostopnih podatkov z nepooblaĹˇÄŤenimi osebami izven podjetja' : 'Sharing login credentials with unauthorized persons outside the company'}</li>
              <li>{isSl ? 'Reverzno inĹľenirstvo ali kopiranje programske opreme' : 'Reverse engineering or copying the software'}</li>
              <li>{isSl ? 'KakrĹˇnakoli dejanja, ki bi Ĺˇkodovala delovanju aplikacije ali drugim uporabnikom' : 'Any actions that would harm the operation of the application or other users'}</li>
            </ul>
            <p className="mt-3">{isSl
              ? 'KrĹˇitev teh doloÄŤil lahko privede do takojĹˇnje prekinitve dostopa do storitve.'
              : 'Violation of these provisions may result in immediate termination of access to the service.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '6. Cene in plaÄŤila' : '6. Pricing and Payments'}</h2>
            <p>{isSl
              ? 'Cenik storitve je dostopen na spletni strani. Vse cene so brez DDV, ki se obraÄŤuna po veljavni zakonodaji. NaroÄŤnina se zaraÄŤunava meseÄŤno ali letno vnaprej, odvisno od izbranega plana.'
              : 'The service pricing is available on the website. All prices are exclusive of VAT, which is charged in accordance with applicable law. Subscriptions are billed monthly or annually in advance, depending on the selected plan.'}</p>
            <p className="mt-3">{isSl
              ? 'Ponudnik si pridrĹľuje pravico do spremembe cen, o ÄŤemer bo uporabnike obvestil vsaj 30 dni vnaprej. RaÄŤun se izda v obliki PDF na e-naslov, vpisan ob registraciji.'
              : 'The provider reserves the right to change prices, with at least 30 days\' notice. Invoices are issued in PDF format to the email address entered during registration.'}</p>
            <p className="mt-3">{isSl
              ? 'Na izdan raÄŤun se je mogoÄŤe pritoĹľiti v roku 8 dni od datuma izstavitve. Ponudnik bo na reklamacijo odgovoril v roku 7 delovnih dni.'
              : 'Invoices may be disputed within 8 days of the issue date. The provider will respond to complaints within 7 business days.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '7. Zamuda pri plaÄŤilu in prekinitev' : '7. Late Payment and Termination'}</h2>
            <p>{isSl
              ? 'Ob zamudi pri plaÄŤilu prejme uporabnik opomin z rokom 8 dni. Ob neplaÄŤilu si ponudnik pridrĹľuje pravico do omejitve dostopa (naÄŤin samo za branje). Po 30 dneh od omejitve se lahko zaÄŤne postopek zaprtja raÄŤuna.'
              : 'In case of late payment, the user receives a reminder with an 8-day deadline. If unpaid, the provider reserves the right to restrict access (read-only mode). After 30 days of restriction, account closure proceedings may begin.'}</p>
            <p className="mt-3">{isSl
              ? 'Pred zaprtjem raÄŤuna ima uporabnik 30 dni za izvoz svojih podatkov v podprtih formatih. Po zaprtju se operativni podatki izbriĹˇejo; varnostne kopije se hranijo Ĺˇe 60 dni.'
              : 'Before account closure, the user has 30 days to export their data in supported formats. After closure, operational data is deleted; backups are retained for 60 days.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '8. Odpoved naroÄŤnine' : '8. Cancellation'}</h2>
            <p className="font-medium text-gray-800 mb-2">{isSl ? 'Odpoved s strani uporabnika' : 'Cancellation by the user'}</p>
            <p>{isSl
              ? 'NaroÄŤnino lahko kadarkoli odpoveste pisno na info@tce.si ali prek funkcionalnosti v aplikaciji. Odpoved zaÄŤne veljati s koncem tekoÄŤega obraÄŤunskega obdobja. Ĺ˝e plaÄŤanih naroÄŤnin ne vraÄŤamo.'
              : 'You can cancel your subscription at any time in writing to info@tce.si or through the application. Cancellation takes effect at the end of the current billing period. We do not refund already paid subscriptions.'}</p>
            <p className="font-medium text-gray-800 mt-4 mb-2">{isSl ? 'Odpoved s strani ponudnika' : 'Cancellation by the provider'}</p>
            <p>{isSl
              ? 'Ponudnik lahko odpove naroÄŤnino z 30-dnevnim odpovednim rokom iz poslovnih razlogov, pri ÄŤemer vrne sorazmerni del vnaprej plaÄŤane naroÄŤnine. V primeru hude krĹˇitve pogojev ali varnostnega incidenta si ponudnik pridrĹľuje pravico do takojĹˇnje prekinitve.'
              : 'The provider may cancel the subscription with 30 days\' notice for business reasons and will refund the proportional part of the prepaid subscription. In case of serious breach of Terms or a security incident, the provider reserves the right to immediate termination.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '9. Lastninska pravica nad podatki' : '9. Data Ownership'}</h2>
            <p>{isSl
              ? 'Vsi podatki, ki jih vnesete v Toolingdesk (kalkulacije, ponudbe, stranke, priponke), so vaĹˇa izkljuÄŤna last. Ponudnik nima pravice do uporabe vaĹˇih podatkov v komercialne namene. Ob prenehanju naroÄŤnine vam omogoÄŤimo izvoz podatkov.'
              : 'All data you enter into Toolingdesk (calculations, quotations, customers, attachments) is your exclusive property. The provider has no right to use your data for commercial purposes. Upon termination, we will enable you to export your data.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '10. Intelektualna lastnina' : '10. Intellectual Property'}</h2>
            <p>{isSl
              ? 'Vse pravice intelektualne lastnine na aplikaciji Toolingdesk in njeni vsebini pripadajo ponudniku ali njegovim dajalcem licence. Uporabniku se podeli neprenosljiva, neizkljuÄŤna licenca za uporabo storitve v okviru izbranega plana. Prepovedano je kopiranje, modificiranje ali distribucija programske opreme brez izrecnega pisnega soglasja ponudnika.'
              : 'All intellectual property rights in the Toolingdesk application and its content belong to the provider or its licensors. The user is granted a non-transferable, non-exclusive licence to use the service under the selected plan. Copying, modifying or distributing the software without the provider\'s explicit written consent is prohibited.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '11. RazpoloĹľljivost storitve' : '11. Service Availability'}</h2>
            <p>{isSl
              ? 'Storitev se trudimo zagotavljati neprekinjeno, vendar ne jamÄŤimo 100-odstotne razpoloĹľljivosti. PridrĹľujemo si pravico do zaÄŤasne prekinitve storitve zaradi vzdrĹľevalnih del, nadgradenj ali tehniÄŤnih razlogov. Za prekinitve, ki nastanejo zaradi viĹˇje sile ali napak tretjih ponudnikov, ne odgovarjamo.'
              : 'We strive to provide the service continuously but do not guarantee 100% availability. We reserve the right to temporarily suspend the service for maintenance, upgrades or technical reasons. We are not liable for interruptions caused by force majeure or third-party provider failures.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '12. Omejitev odgovornosti' : '12. Limitation of Liability'}</h2>
            <p className="mb-3">{isSl
              ? 'Storitev je na voljo Â»kot jeÂ«. Ponudnik ne odgovarja za:'
              : 'The service is provided "as is". The provider is not liable for:'}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{isSl ? 'Posredno ali poslediÄŤno Ĺˇkodo, ki izhaja iz uporabe aplikacije' : 'Indirect or consequential damage arising from the use of the application'}</li>
              <li>{isSl ? 'Napake v kalkulacijah ali ponudbah, ustvarjenih s pomoÄŤjo aplikacije' : 'Errors in calculations or quotations created using the application'}</li>
              <li>{isSl ? 'Izgubo prihodkov ali poslovnih priloĹľnosti' : 'Loss of revenue or business opportunities'}</li>
              <li>{isSl ? 'Ĺ kodo nastalo zaradi prekinitev delovanja ali izgube podatkov' : 'Damage caused by service interruptions or data loss'}</li>
              <li>{isSl ? 'Napake ali prekinitve na strani tretjih ponudnikov (gostovanje, avtentikacija)' : 'Errors or interruptions by third-party providers (hosting, authentication)'}</li>
            </ul>
            <p className="mt-4 font-medium text-gray-800">{isSl
              ? 'Skupna odgovornost ponudnika v nobenem primeru ne presega zneska naroÄŤnin, ki ste jih plaÄŤali v zadnjih 3 mesecih pred nastankom Ĺˇkode.'
              : 'The provider\'s total liability shall in no case exceed the amount of subscriptions paid by you in the 3 months preceding the damage.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '13. Varovanje podatkov strank' : '13. Customer Data Protection'}</h2>
            <p>{isSl
              ? 'Uporabnik je kot upravljavec osebnih podatkov svojih strank odgovoren za zakonito obdelavo podatkov v skladu z GDPR in veljavno zakonodajo. Ponudnik deluje kot obdelovalec in podatke obdeluje izkljuÄŤno po navodilih uporabnika ter jih ne posreduje tretjim osebam brez soglasja.'
              : 'As the controller of their customers\' personal data, the user is responsible for lawful data processing in accordance with GDPR and applicable law. The provider acts as a processor and processes data exclusively on the user\'s instructions, and does not share it with third parties without consent.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '14. Zaupnost' : '14. Confidentiality'}</h2>
            <p>{isSl
              ? 'Obe stranki varovata vse nejavne informacije druge stranke kot poslovno skrivnost in jih uporabljata izkljuÄŤno za izvrĹˇevanje pogodbenega razmerja. Ta obveznost velja tudi po prenehanju pogodbe.'
              : 'Both parties treat all non-public information of the other party as a trade secret and use it exclusively for the performance of the contractual relationship. This obligation applies even after termination of the agreement.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '15. ViĹˇja sila' : '15. Force Majeure'}</h2>
            <p>{isSl
              ? 'Ponudnik ne odgovarja za neizpolnitev obveznosti, ki izhaja iz okoliĹˇÄŤin, na katere nima vpliva (naravne nesreÄŤe, izpadi interneta, vojni konflikti, pandemije, motnje tretjih ponudnikov). V takĹˇnih primerih se roki sorazmerno podaljĹˇajo. ÄŚe viĹˇja sila traja veÄŤ kot 30 dni, lahko katera koli stranka pogodbo odpove z obvestilom.'
              : 'The provider is not liable for failure to fulfil obligations resulting from circumstances beyond their control (natural disasters, internet outages, armed conflicts, pandemics, third-party disruptions). In such cases, deadlines are proportionally extended. If force majeure lasts more than 30 days, either party may terminate the agreement with notice.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '16. ReĹˇevanje sporov in veljavno pravo' : '16. Dispute Resolution and Governing Law'}</h2>
            <p>{isSl
              ? 'Za te pogoje velja pravo Republike Slovenije. Stranki spor najprej poskuĹˇata reĹˇiti sporazumno. V primeru neuspeha je za reĹˇevanje sporov pristojno sodiĹˇÄŤe v [KRAJ].'
              : 'These Terms are governed by the law of the Republic of Slovenia. The parties will first attempt to resolve any dispute amicably. If unsuccessful, the competent court in [KRAJ] has jurisdiction.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{isSl ? '17. Kontakt' : '17. Contact'}</h2>
            <p>{isSl ? 'Za vpraĹˇanja v zvezi s pogoji poslovanja nas kontaktirajte na ' : 'For questions regarding these Terms, contact us at '}
              <a href="mailto:info@tce.si" className="text-blue-600 hover:underline">info@tce.si</a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link to="/" className="text-sm text-blue-600 hover:underline">{isSl ? 'â† Nazaj na domaÄŤo stran' : 'â† Back to home'}</Link>
        </div>
      </div>
    </div>
  )
}

