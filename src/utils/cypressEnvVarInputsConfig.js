import { 
    ENABLE_RENTAL_PROTECTION_WITH_API,
    LEASE_START_DATE,
    ACCEPTED_STATES,
 } from "../../cypress/constants/CYPRESS_ENV_VARS";
import RENTAL_PROTECTION_ACCEPTED_STATES from "../../cypress/constants/RENTAL_PROTECTION_ACCEPTED_STATES";

export default [
    {
        key: ENABLE_RENTAL_PROTECTION_WITH_API,
        type: 'checkbox',
        defaultValue: null,
        description: 'Speeds up test by skipping posting path flow'
    },
    {
        key: LEASE_START_DATE,
        type: 'date',
        defaultValue: null,
    },
    {
        key: ACCEPTED_STATES,
        type: 'multiple-select',
        options: RENTAL_PROTECTION_ACCEPTED_STATES,
        defaultValue: null,
        description: 'Determines which states listing could be created in'
    },
]
