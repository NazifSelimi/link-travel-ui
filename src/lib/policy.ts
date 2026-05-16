export const travelPolicyPdfPath = '/policies/link-travel-general-travel-conditions.pdf';

export const agencyContact = {
  phone: '+389 71 726 726',
  email: 'linktravelnmk@gmail.com',
  address: 'Rr. Ivo Lola Ribar 32, Gostivar',
};

export const reservationPolicySummary = [
  'Submitting the form creates a reservation request, not an automatically confirmed or paid booking.',
  'Link Travel will contact the traveler to confirm availability, final price, documents, deadlines, and next steps.',
  'Payment is not collected on this website. Payment is arranged directly with the agency, in person or through an agency-approved method.',
  'Travel services are subject to the official General Travel Conditions document, plus the specific hotel, airline, operator, visa, baggage, and cancellation rules for the selected offer.',
  'Prices and availability can change until the agency confirms the reservation and payment/deposit instructions.',
];

export const localizedPolicySummaries = [
  {
    language: 'Shqip',
    title: 'Kushtet e pergjithshme te udhetimit',
    items: [
      'Forma online dergon kerkese rezervimi dhe nuk eshte rezervim i konfirmuar automatikisht.',
      'Link Travel do t’ju kontaktoje per disponueshmeri, cmim final, dokumente, afate dhe hapat e pageses.',
      'Pagesa nuk behet ne web. Pagesa kryhet direkt me agjencine, ne zyre ose sipas menyres se konfirmuar nga agjencia.',
    ],
  },
  {
    language: 'Македонски',
    title: 'Општи услови за патување',
    items: [
      'Онлајн формата испраќа барање за резервација и не претставува автоматски потврдена резервација.',
      'Link Travel ќе ве контактира за достапност, конечна цена, документи, рокови и следни чекори за плаќање.',
      'Плаќањето не се врши преку веб-страницата. Плаќањето се договара директно со агенцијата, лично или на начин потврден од агенцијата.',
    ],
  },
  {
    language: 'English',
    title: 'General travel conditions',
    items: reservationPolicySummary.slice(0, 3),
  },
];
