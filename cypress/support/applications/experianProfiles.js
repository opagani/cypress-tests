const EXPERIAN_PROFILES = [
  // Anabel has 1 eviction record hit & 5 criminal record hits
  {
    userId: 103,
    firstName: 'anabel',
    middleName: '',
    lastName: 'whalen',
    currentAddress: '1461 Lake Christopher Dr',
    currentCity: 'Virginia Beach',
    currentState: 'VA',
    currentZip: '234647307',
    previousAddresses: [],
    gen: null,
    ssn: '666-60-4389',
    dob: '01011974',
    questionMap: {
      'I was born within a year or on the year of the date below.': '1974',
      'Using your date of birth, please select your astrological sun sign of the zodiac from the following choices.':
        'VIRGO',
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'SAINT BARNABAS HOSPITAL',
    },
    questionExtraMap: {},
  },
  // Thomas has no eviction or criminal hits
  {
    userId: 145,
    firstName: 'thomas',
    middleName: 'l',
    lastName: 'chen',
    currentAddress: '1401 e rose ave',
    currentCity: 'orange',
    currentState: 'CA',
    currentZip: '928677033',
    previousAddresses: [],
    gen: null,
    ssn: '666708855',
    dob: '01011974',
    questionMap: {
      'Please select the county for the address you provided.': 'ORANGE',
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'RETIRED',
    },
    questionExtraMap: {},
  },
  // Danny has 2 eviction hits and no criminal hits
  {
    userId: 110,
    firstName: 'danny',
    middleName: '',
    lastName: 'roberts',
    currentAddress: '410 E MAIN ST APT B',
    currentCity: 'GREENFIELD',
    currentState: 'IN',
    currentZip: '461402363',
    previousAddresses: [],
    gen: null,
    ssn: '666-42-0066',
    dob: '04031936',
    questionMap: {
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'SMITH CULLUM INC',
      'You currently or previously resided on one of the following streets. Please select the street name from the following choices.':
        'AMERICAN LEGION',
      'According to our records, you previously lived on (AMERICAN LEGION). Please choose the city from the following list where this street is located.':
        'GREENFIELD',
    },
    questionExtraMap: {
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'NONE OF THE ABOVE/DOES NOT APPLY',
      'You currently or previously resided on one of the following streets. Please select the street name from the following choices.':
        'FERN',
    },
  },
  // Charles has no criminal or eviction record hits
  {
    userId: 107,
    firstName: 'charles',
    middleName: 'e',
    lastName: 'young',
    currentAddress: '303 county road 42',
    currentCity: 'gibsonburg',
    currentState: 'OH',
    currentZip: '434319502',
    previousAddresses: [],
    gen: null,
    ssn: '666-27-1890',
    dob: '06151935',
    questionMap: {
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'HOOTERS',
      'Please select the city that you have previously resided in': 'GIBSONBURG',
      'Please select the county for the address you provided.': 'SANDUSKY',
      'You currently or previously resided on one of the following streets. Please select the street name from the following choices.':
        'C R 42',
    },
    questionExtraMap: {},
  },
  // James has 2 eviction, 11 criminal including 5 sex offender hits... bad James >:(
  {
    userId: 118,
    firstName: 'james',
    middleName: 'j',
    lastName: 'bergman',
    currentAddress: 'po box 91',
    currentCity: 'north marshfield',
    currentState: 'MA',
    currentZip: '020590091',
    previousAddresses: [],
    gen: null,
    ssn: '666-38-6692',
    dob: '01011974',
    questionMap: {
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'RETIRED',
    },
    questionExtraMap: {},
  },
  // Terry has no eviction or criminal hits
  {
    userId: 144,
    firstName: 'terry',
    middleName: 'l',
    lastName: 'raman',
    currentAddress: '3416 shakertown rd',
    currentCity: 'antioch',
    currentState: 'TN',
    currentZip: '370131099',
    previousAddresses: [],
    gen: null,
    ssn: '666-11-2023',
    dob: '01011974',
    questionMap: {
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'MCDONNELL DOUGLAS AEROS',
    },
    questionExtraMap: {},
  },
  // Lyndsay has disputed criminal report and 3 eviction record hits
  {
    userId: 126,
    firstName: 'lyndsay',
    middleName: '',
    lastName: 'free',
    currentAddress: '9505 royal ln apt 1115',
    currentCity: 'dallas',
    currentState: 'TX',
    currentZip: '752437653',
    previousAddresses: [],
    gen: null,
    ssn: '666-69-0639',
    dob: '12031975',
    questionMap: {
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'PAYLESS SHOE SOURCE',
    },
    questionExtraMap: {},
  },
  // Mike has 2 eviction hits & 1 criminal hit with all possible CIC fields. Use Minneapolis listing to return
  // regional disclaimer.
  {
    firstName: 'Mike',
    middleName: '',
    lastName: 'Beene',
    currentAddress: '564 MARYLAND AVE APT 31',
    currentCity: 'PITTSBURGH',
    currentState: 'PA',
    currentZip: '152022966',
    previousAddresses: [],
    gen: null,
    ssn: '666117440',
    dob: '06061972',
    questionMap: {
      'I was born within a year or on the year of the date below.': '1972',
      'Using your date of birth, please select your astrological sun sign of the zodiac from the following choices.':
        'GEMINI',
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'HAIR CUTTERY',
    },
    questionExtraMap: {},
  },
  // Gail has 3 eviction and 2 criminal hits
  {
    firstName: 'Gail',
    middleName: '',
    lastName: 'Hesser',
    currentAddress: '2170 S C ROAD 43',
    currentCity: 'REPUBLIC',
    currentState: 'OH',
    currentZip: '44867',
    previousAddresses: [],
    gen: null,
    ssn: '666710133',
    dob: '10151974',
    questionMap: {
      'I was born within a year or on the year of the date below.': '1974',
      'Using your date of birth, please select your astrological sun sign of the zodiac from the following choices':
        'LIBRA',
    },
    questionExtraMap: {},
  },
  // Johnnie has eviction records IN_DISPUTE and 2 criminal records but no sex offender records
  {
    userId: 118,
    firstName: 'johnnie',
    middleName: '',
    lastName: 'bay',
    currentAddress: '4621 tulip tree ct',
    currentCity: 'chantilly',
    currentState: 'VA',
    currentZip: '22021',
    previousAddresses: [],
    gen: null,
    ssn: '666-66-9201',
    dob: '07291959',
    questionMap: {
      'Please select the city that you have previously resided in.': 'NEW YORK',
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'FORDS PAPER HANGING',
      "Which of the following is the highest level of education you have completed?  If there is not a matched educational level, please select 'NONE OF THE ABOVE'.":
        'BACHELOR DEGREE',
    },
    questionExtraMap: {},
  },
  // Izell has no eviction records and missing criminal record due to INVALID_SSN
  {
    userId: 144,
    firstName: 'izell',
    middleName: '',
    lastName: 'russell',
    currentAddress: '17151 w bernardo dr apt 103',
    currentCity: 'san diego',
    currentState: 'CA',
    currentZip: '921271530',
    previousAddresses: [],
    gen: null,
    ssn: '666-05-0001',
    dob: '12151961',
    questionMap: {
      "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
        'USARMYROUTE',
      'According to our records, you previously lived on (DONZEE). Please choose the city from the following list where this street is located.':
        'SAN DIEGO',
      'Using your date of birth, please select your astrological sun sign of the zodiac from the following choices.':
        'SAGGITARIUS',
      'I was born within a year or on the year of the date below.': '1961',
    },
    questionExtraMap: {},
  },
  // Bradley has eviction records IN_DISPUTE and criminal records IN_DISPUTE
  {
    firstName: 'bradley',
    middleName: '',
    lastName: 'lanier',
    currentAddress: '2010 peach orchard dr apt 23',
    currentCity: 'falls church',
    currentState: 'VA',
    currentZip: '220432038',
    previousAddresses: [],
    gen: null,
    ssn: '666-35-1195',
    dob: '11131919',
    questionMap: {
      'You currently or previously resided on one of the following streets. Please select the street name from the following choices.':
        'VIA ANDAR',
      'According to your credit profile, you may have opened a (SYNCB/JC PENNEY DC) credit card. Please select the year in which your account was opened.':
        '2020',
      'Please select the city that you have previously resided in.': 'WILLIAMSBURG',
      'According to our records, you previously lived on (VIA ANDAR). Please choose the city from the following list where this street is located.':
        'SAN DIEGO',
    },
    questionExtraMap: {},
  },
  // Eggleston has an unavailable BG report due to the BG system being unavailable at time of report creation
  {
    firstName: 'Eggleston',
    middleName: '',
    lastName: 'Mary',
    currentAddress: '1408 S GRANGE AVE',
    currentCity: 'SIOUX FALLS',
    currentState: 'SD',
    currentZip: '571051525',
    previousAddresses: [],
    gen: null,
    ssn: '666-57-8868',
    dob: '01041954',
    questionMap: {
      'According to our records, you previously lived on (S). Please choose the city from the following list where this street is located.':
        'SIOUX FALLS',
      'You currently or previously resided on one of the following streets. Please select the street name from the following choices.':
        'S',
    },
    questionExtraMap: {},
  },
];

module.exports = EXPERIAN_PROFILES;
