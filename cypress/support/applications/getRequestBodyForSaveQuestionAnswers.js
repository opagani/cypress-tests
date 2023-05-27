const { v4: uuidv4 } = require('uuid');

const EXPERIAN_USER_ANABEL = {
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
  questionMap: {
    'I was born within a year or on the year of the date below.': '1974',
    'Using your date of birth, please select your astrological sun sign of the zodiac from the following choices.':
      'VIRGO',
    "Which of the following is a current or previous employer? If there is not a matched employer name, please select 'NONE OF THE ABOVE'.":
      'SAINT BARNABAS HOSPITAL',
  },
  questionExtraMap: {},
};

const INCOME_SOURCE_EMPLOYMENT = {
  incomeType: 'employment',
  jobTitle: 'Consultant',
  employer: 'Law firm',
  startDate: '03/01/2017',
  monthlyIncome: '$7,000.13',
  employerName: 'Mary',
  employerEmail: 'mary@lawfirm.com',
  employerPhone: '3032345560',
  incomeSourceNote: 'This is a side gig until my influencer career takes off.',
};

// https://gitlab.zgtools.net/zillow/rental-applications/tg-comet-rentals-tests/-/blob/master/comet_rentals_tests/lib/api_setup_utils.py#L793
const getRequestBodyForSaveQuestionAnswers = () => {
  const currentHome = {
    id: 'residenceHistoryCurrentHome',
    value: [
      {
        homeType: 'rent',
        street: EXPERIAN_USER_ANABEL['currentAddress'],
        city: EXPERIAN_USER_ANABEL['currentCity'],
        state: EXPERIAN_USER_ANABEL['currentState'],
        zip: EXPERIAN_USER_ANABEL['currentZip'],
        monthlyRent: '$2,000.37',
        reasonForMoving: 'I wanted to move to a new neighborhood',
        movedIn: '02/01/2018',
        managerName: 'George',
        managerPhone: '3038675309',
        managerEmail: 'george@george.com',
      },
    ],
  };

  const additionalHomes = {
    id: 'residenceHistoryAdditionalHomes',
    value: [
      {
        homeType: 'rent',
        city: 'Seattle',
        managerEmail: 'fred@fred.com',
        managerName: 'Fred',
        managerPhone: '3035505566',
        movedIn: '01/01/2014',
        movedOut: '02/03/2019',
        state: 'WA',
        street: 'Elm Street',
        zip: '80202',
      },
    ],
  };

  const incomeSourceEmploymentWithIncomeSourceId = { ...INCOME_SOURCE_EMPLOYMENT };
  incomeSourceEmploymentWithIncomeSourceId['incomeSourceId'] = uuidv4(); // random UUID
  const incomeSourceList = [incomeSourceEmploymentWithIncomeSourceId];

  const incomeSources = {
    id: 'currentIncome',
    value: incomeSourceList,
  };

  const pastJobs = {
    id: 'pastJobs',
    value: [
      {
        jobTitle: 'Barista',
        employer: 'Starbucks',
        startDate: '02/01/2015',
        endDate: '02/15/2017',
        employerName: 'Harry',
        employerEmail: 'harry@sbux.com',
        employerPhone: '6760303030',
      },
      {
        jobTitle: 'Surgeon',
        employer: 'Grey and Sloan Memorial Hospital',
        startDate: '03/27/2005',
        endDate: '04/09/2020',
        employerName: 'Joseph',
        employerEmail: 'joseph@example.com',
        employerPhone: '2815550987',
      },
      {
        jobTitle: 'Writer',
        employer: 'Philomel',
        startDate: '10/15/1986',
        endDate: '10/15/2011',
        employerName: 'Brian Jacques',
        employerEmail: 'jacques@example.com',
        employerPhone: '9025550987',
      },
      {
        jobTitle: 'Director',
        employer: 'Lucasfilms',
        startDate: '05/25/1977',
        endDate: '05/25/1983',
        employerName: 'George Lucas',
        employerEmail: 'lucas@example.com',
        employerPhone: '2815550987',
      },
    ],
  };

  const pets = {
    id: 'pets',
    value: {
      smallDogs: 2,
      mediumDogs: 1,
      largeDogs: 2,
      cats: 1,
      other: 2,
    },
  };

  const petsDescription = {
    id: 'petsDescription',
    value: 'I also have a really nice and friendly panda. It is not large at all.',
  };

  const answers = [
    { id: 'firstName', value: EXPERIAN_USER_ANABEL['firstName'] },
    { id: 'middleName', value: EXPERIAN_USER_ANABEL['middleName'] },
    { id: 'lastName', value: EXPERIAN_USER_ANABEL['lastName'] },
    { id: 'phoneNumber', value: '(206) 555-1212' },
    { id: 'email', value: 'jimbobfisheries@notification.hotpads.com' },
    { id: 'emergencyContactPhone', value: '(206) 555-1111' },
    { id: 'emergencyContactEmail', value: 'hermione@gmail.com' },
    { id: 'emergencyContactRelationship', value: 'friend' },
    { id: 'emergencyContactName', value: 'Hermione' },
    { id: 'smoker', value: 'no' },
    { id: 'receivedNotice', value: 'no' },
    { id: 'evicted', value: 'no' },
    { id: 'smoker', value: 'no' },
    { id: 'aboutMe', value: 'I am very clean and always pay rent on time' },
    { id: 'jobTitle', value: 'Consultant' },
    { id: 'monthlyIncome', value: '7,000' },
    { id: 'occupants', value: '1' },
    { id: 'moveInDate', value: '04/01/2019' },
    { id: 'backgroundReportComment', value: 'Please let me know if you have any questions on this report' },
    {
      id: 'creditReportComment',
      value: 'I had unexpected medical expenses that affected my credit score. However, I always pay rent on time',
    },
    currentHome,
    additionalHomes,
    pastJobs,
    incomeSources,
    pets,
    petsDescription,
  ];

  return answers;
};

module.exports = getRequestBodyForSaveQuestionAnswers;
