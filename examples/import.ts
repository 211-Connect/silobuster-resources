import { DataBridge } from "..";
import getRecordsAndCache from "../utils/getRecordsAndCache";
import fetchFromBigQuery from "../utils/fetchFromBigQuery";
import checkAndAdd from "../utils/checkAndAdd";
import deleteRecordsUtil from "../utils/deleteRecordsUtil";

export default async function importData(this: DataBridge) {
  /****************************************************************************
   * This part of the process gets all records from OUR sql database and caches them
   ***************************************************************************
   ***************************************************************************/
  this.logger.debug("Caching sql");

  const sqlPromises = [
    getRecordsAndCache.bind(this, "taxonomy_term_translations")(),
    getRecordsAndCache.bind(this, "organization_translations")(),
    getRecordsAndCache.bind(this, "program_translations")(),
    getRecordsAndCache.bind(this, "location_translations")(),
    getRecordsAndCache.bind(this, "physical_address")(),
    getRecordsAndCache.bind(this, "postal_address")(),
    getRecordsAndCache.bind(this, "service_translations")(),
    getRecordsAndCache.bind(this, "contact_translations")(),
    getRecordsAndCache.bind(this, "eligibility_translations")(),
    getRecordsAndCache.bind(this, "language")(),
    getRecordsAndCache.bind(this, "payment_accepted_translations")(),
    getRecordsAndCache.bind(this, "phone_translations")(),
    getRecordsAndCache.bind(this, "required_document_translations")(),
    getRecordsAndCache.bind(this, "schedule_translations")(),
    getRecordsAndCache.bind(this, "c_search_translations")(),
    getRecordsAndCache.bind(this, "service_area_translations")(),
    getRecordsAndCache.bind(this, "service_at_location_translations")(),
    getRecordsAndCache.bind(this, "service_attribute")(),
  ];

  try {
    await Promise.all(sqlPromises);
  } catch (err) {
    this.logger.error(err);
  }

  this.logger.debug("Done caching sql");

  /***************************************************************************
   * This part of the process gets all records from Big Query and caches them
   ***************************************************************************
   ***************************************************************************/
  this.logger.debug("Caching records");

  const bigQueryPromises = [
    fetchFromBigQuery.bind(
      this,
      "accessibility_for_disabilities",
      "accessibility_for_disabilities_translations"
    )(),
    fetchFromBigQuery.bind(this, "language", "language")(),
    fetchFromBigQuery.bind(this, "com_location", "location_translations")(),
    fetchFromBigQuery.bind(this, "organization", "organization_translations")(),
    fetchFromBigQuery.bind(this, "phone", "phone_translations")(),
    fetchFromBigQuery.bind(this, "physical_address", "physical_address")(),
    fetchFromBigQuery.bind(this, "postal_address", "postal_address")(),
    fetchFromBigQuery.bind(this, "schedule", "schedule_translations")(),
    fetchFromBigQuery.bind(this, "service", "service_translations")(),
    fetchFromBigQuery.bind(this, "service_area", "service_area_translations")(),
    fetchFromBigQuery.bind(
      this,
      "service_at_location",
      "service_at_location_translations"
    )(),
    fetchFromBigQuery.bind(this, "service_attribute", "service_attribute")(),
    fetchFromBigQuery.bind(
      this,
      "taxonomy_term",
      "taxonomy_term_translations"
    )(),
    fetchFromBigQuery.bind(this, "com_search", "c_search_translations")(),
    fetchFromBigQuery.bind(this, "eligibility", "eligibility_translations")(),
  ];

  try {
    await Promise.all(bigQueryPromises);
  } catch (err) {
    this.logger.error(err);
  }

  /***************************************************************************
   * This part of the process creates a virtual record in cache of all incoming data
   ***************************************************************************
   ***************************************************************************/

  const organizations =
    this.caches.bigQuery.organization_translations.toArray();
  for (const organization of organizations) {
    const organizationModel = new this.models.OrganizationTranslations({
      organization_id: organization[this.dataMapping.organization.id],
      name: organization[this.dataMapping.organization.name],
      alternate_name:
        organization[this.dataMapping.organization.alternate_name],
      description: organization[this.dataMapping.organization.description],
      short_description:
        organization[this.dataMapping.organization.short_description],
      url: organization[this.dataMapping.organization.url],
      tax_id: organization[this.dataMapping.organization.tax_id],
      legal_status: organization[this.dataMapping.organization.legal_status],
      email: organization[this.dataMapping.organization.email],
      tax_status: organization[this.dataMapping.organization.tax_status],
      year_incorporated:
        organization[this.dataMapping.organization.year_incorporated],
      locale: organization[this.dataMapping.organization.locale],
      tenant_id: this.config.tenantId,
      is_canonical: true,
    });

    await organizationModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const locations = this.caches.bigQuery.location_translations.toArray();
  for (const location of locations) {
    const locationModel = new this.models.LocationTranslations({
      location_id: location[this.dataMapping.location.id],
      organization_id: location[this.dataMapping.location.organization_id],
      name: location[this.dataMapping.location.name],
      description: location[this.dataMapping.location.description],
      short_description: location[this.dataMapping.location.short_description],
      transportation: location[this.dataMapping.location.transportation],
      latitude: location[this.dataMapping.location.latitude],
      longitude: location[this.dataMapping.location.longitude],
      alternate_name: location[this.dataMapping.location.alternate_name],
      locale: location[this.dataMapping.location.locale],
      tenant_id: this.config.tenantId,
      is_canonical: true,
    });

    await locationModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const accessibilityForDisabilities =
    this.caches.bigQuery.accessibility_for_disabilities_translations.toArray();
  for (const accessibilityForDisability of accessibilityForDisabilities) {
    const accessibilityForDisabilityModel =
      new this.models.AccessibilityForDisabilitiesTranslations({
        accessibility_for_disabilities_id:
          accessibilityForDisability[
            this.dataMapping.accessibility_for_disabilities.id
          ],
        location_id:
          accessibilityForDisability[
            this.dataMapping.accessibility_for_disabilities.location_id
          ],
        accessibility:
          accessibilityForDisability[
            this.dataMapping.accessibility_for_disabilities.accessibility
          ],
        locale:
          accessibilityForDisability[
            this.dataMapping.accessibility_for_disabilities.locale
          ],
        tenant_id: this.config.tenantId,
        is_canonical: true,
      });

    await accessibilityForDisabilityModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const services = this.caches.bigQuery.service_translations.toArray();
  for (const service of services) {
    const serviceModel = new this.models.ServiceTranslations({
      service_id: service[this.dataMapping.service.id],
      organization_id: service[this.dataMapping.service.organization_id],
      program_id: service[this.dataMapping.service.program_id],
      name: service[this.dataMapping.service.name],
      alternate_name: service[this.dataMapping.service.alternate_name],
      description: service[this.dataMapping.service.description],
      short_description: service[this.dataMapping.service.short_description],
      url: service[this.dataMapping.service.url],
      email: service[this.dataMapping.service.email],
      status: service[this.dataMapping.service.status],
      interpretation_services:
        service[this.dataMapping.service.interpretation_services],
      application_process:
        service[this.dataMapping.service.application_process],
      fees: service[this.dataMapping.service.fees],
      taxonomy_ids: service[this.dataMapping.service.taxonomy_ids],
      emergency_info: service[this.dataMapping.service.emergency_info],
      wait_time: service[this.dataMapping.service.wait_time],
      accreditations: service[this.dataMapping.service.accreditations],
      licenses: service[this.dataMapping.service.licenses],
      locale: service[this.dataMapping.service.locale],
      tenant_id: this.config.tenantId,
      is_canonical: true,
    });

    await serviceModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const languages = this.caches.bigQuery.language.toArray();
  for (const language of languages) {
    const languageModel = new this.models.Language({
      id: language[this.dataMapping.language.id],
      service_id: language[this.dataMapping.language.service_id],
      location_id: language[this.dataMapping.language.location_id],
      language: language[this.dataMapping.language.language],
      tenant_id: this.config.tenantId,
    });

    await languageModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const physicalAddresses = this.caches.bigQuery.physical_address.toArray();
  for (const physicalAddress of physicalAddresses) {
    const physicalAddressModel = new this.models.PhysicalAddress({
      id: physicalAddress[this.dataMapping.physical_address.id],
      location_id:
        physicalAddress[this.dataMapping.physical_address.location_id],
      address_1: physicalAddress[this.dataMapping.physical_address.address_1],
      city: physicalAddress[this.dataMapping.physical_address.city],
      region: physicalAddress[this.dataMapping.physical_address.region],
      state_province:
        physicalAddress[this.dataMapping.physical_address.state_province],
      postal_code:
        physicalAddress[this.dataMapping.physical_address.postal_code],
      country: physicalAddress[this.dataMapping.physical_address.country],
      attention: physicalAddress[this.dataMapping.physical_address.attention],
      tenant_id: this.config.tenantId,
    });

    await physicalAddressModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const postalAddresses = this.caches.bigQuery.postal_address.toArray();
  for (const postalAddress of postalAddresses) {
    const postalAddressModel = new this.models.PostalAddress({
      id: postalAddress[this.dataMapping.postal_address.id],
      location_id: postalAddress[this.dataMapping.postal_address.location_id],
      address_1: postalAddress[this.dataMapping.postal_address.address_1],
      city: postalAddress[this.dataMapping.postal_address.city],
      region: postalAddress[this.dataMapping.postal_address.region],
      state_province:
        postalAddress[this.dataMapping.postal_address.state_province],
      postal_code: postalAddress[this.dataMapping.postal_address.postal_code],
      country: postalAddress[this.dataMapping.postal_address.country],
      attention: postalAddress[this.dataMapping.postal_address.attention],
      tenant_id: this.config.tenantId,
    });

    await postalAddressModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const serviceAtLocations =
    this.caches.bigQuery.service_at_location_translations.toArray();
  for (const serviceAtLocation of serviceAtLocations) {
    const serviceAtLocationModel =
      new this.models.ServiceAtLocationTranslations({
        service_at_location_id:
          serviceAtLocation[this.dataMapping.service_at_location.id],
        service_id:
          serviceAtLocation[this.dataMapping.service_at_location.service_id],
        location_id:
          serviceAtLocation[this.dataMapping.service_at_location.location_id],
        description:
          serviceAtLocation[this.dataMapping.service_at_location.description],
        locale: serviceAtLocation[this.dataMapping.service_at_location.locale],
        tenant_id: this.config.tenantId,
        is_canonical: true,
      });

    await serviceAtLocationModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const schedules = this.caches.bigQuery.schedule_translations.toArray();
  for (const schedule of schedules) {
    const scheduleModel = new this.models.ScheduleTranslations({
      schedule_id: schedule[this.dataMapping.schedule.id],
      service_id: schedule[this.dataMapping.schedule.service_id],
      description: schedule[this.dataMapping.schedule.description],
      location_id: schedule[this.dataMapping.schedule.location_id],
      service_at_location_id:
        schedule[this.dataMapping.schedule.service_at_location_id],
      valid_from: schedule[this.dataMapping.schedule.valid_from],
      valid_to: schedule[this.dataMapping.schedule.valid_to],
      dtstart: schedule[this.dataMapping.schedule.dtstart],
      until: schedule[this.dataMapping.schedule.until],
      wkst: schedule[this.dataMapping.schedule.wkst],
      freq: schedule[this.dataMapping.schedule.freq],
      interval: schedule[this.dataMapping.schedule.interval],
      byday: schedule[this.dataMapping.schedule.byday],
      byweekno: schedule[this.dataMapping.schedule.byweekno],
      bymonthday: schedule[this.dataMapping.schedule.bymonthday],
      byyearday: schedule[this.dataMapping.schedule.byyearday],
      opens_at: schedule[this.dataMapping.schedule.opens_at],
      closes_at: schedule[this.dataMapping.schedule.closes_at],
      count: schedule[this.dataMapping.schedule.count],
      locale: schedule[this.dataMapping.schedule.locale],
      tenant_id: this.config.tenantId,
      is_canonical: true,
    });

    await scheduleModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const eligibilities = this.caches.bigQuery.eligibility_translations.toArray();
  for (const eligibility of eligibilities) {
    const eligibilityModel = new this.models.EligibilityTranslations({
      eligibility_id: eligibility[this.dataMapping.eligibility.id],
      service_id: eligibility[this.dataMapping.eligibility.service_id],
      description: eligibility[this.dataMapping.eligibility.description],
      locale: eligibility[this.dataMapping.eligibility.locale],
      tenant_id: this.config.tenantId,
      is_canonical: true,
    });

    await eligibilityModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const phones = this.caches.bigQuery.phone_translations.toArray();
  for (const phone of phones) {
    const phoneModel = new this.models.PhoneTranslations({
      phone_id: phone[this.dataMapping.phone.id],
      organization_id: phone[this.dataMapping.phone.organization_id],
      location_id: phone[this.dataMapping.phone.location_id],
      service_at_location_id:
        phone[this.dataMapping.phone.service_at_location_id],
      service_id: phone[this.dataMapping.phone.service_id],
      contact_id: phone[this.dataMapping.phone.contact_id],
      number: phone[this.dataMapping.phone.number],
      extension: phone[this.dataMapping.phone.extension],
      description: phone[this.dataMapping.phone.description],
      type: phone[this.dataMapping.phone.type],
      language: phone[this.dataMapping.phone.language],
      locale: phone[this.dataMapping.phone.locale],
      tenant_id: this.config.tenantId,
      is_canonical: true,
    });

    await phoneModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const taxonomyTerms =
    this.caches.bigQuery.taxonomy_term_translations.toArray();
  for (const term of taxonomyTerms) {
    const taxonomyTermModel = new this.models.TaxonomyTermTranslations({
      taxonomy_term_id: term[this.dataMapping.taxonomy_term.id],
      term: term[this.dataMapping.taxonomy_term.term],
      description: term[this.dataMapping.taxonomy_term.description],
      taxonomy: term[this.dataMapping.taxonomy_term.taxonomy],
      parent_id: term[this.dataMapping.taxonomy_term.parent_id],
      language: term[this.dataMapping.taxonomy_term.language],
      locale: term[this.dataMapping.taxonomy_term.locale],
      tenant_id: this.config.tenantId,
      is_canonical: true,
    });

    await taxonomyTermModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const serviceAttributes = this.caches.bigQuery.service_attribute.toArray();
  for (const attr of serviceAttributes) {
    const serviceAttributeModel = new this.models.ServiceAttribute({
      id: attr[this.dataMapping.service_attribute.id],
      service_id: attr[this.dataMapping.service_attribute.service_id],
      taxonomy_term_id:
        attr[this.dataMapping.service_attribute.taxonomy_term_id],
      tenant_id: this.config.tenantId,
    });

    await serviceAttributeModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  const serviceAreas = this.caches.bigQuery.service_area_translations.toArray();
  for (const serviceArea of serviceAreas) {
    const serviceAreaModel = new this.models.ServiceAreaTranslations({
      service_area_id: serviceArea[this.dataMapping.service_area.id],
      description: serviceArea[this.dataMapping.service_area.description],
      extent: serviceArea[this.dataMapping.service_area.extent],
      extent_type: serviceArea[this.dataMapping.service_area.extent_type],
      service_id: serviceArea[this.dataMapping.service_area.service_id],
      service_area: serviceArea[this.dataMapping.service_area.service_area],
      locale: serviceArea[this.dataMapping.service_area.locale],
      tenant_id: this.config.tenantId,
      is_canonical: true,
    });

    await serviceAreaModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  /**
   * Search
   */
  const searchRecords = this.caches.bigQuery.c_search_translations.toArray();
  for (const searchRecord of searchRecords) {
    const searchModel = new this.models.CSearchTranslations({
      c_search_id: searchRecord[this.dataMapping.c_search.id],
      service_id: searchRecord[this.dataMapping.c_search.service_id],
      service_at_location_id:
        searchRecord[this.dataMapping.c_search.service_at_location_id],
      location_id: searchRecord[this.dataMapping.c_search.location_id],
      organization_id: searchRecord[this.dataMapping.c_search.organization_id],
      service_name: searchRecord[this.dataMapping.c_search.service_name],
      service_description:
        searchRecord[this.dataMapping.c_search.service_description],
      service_short_description:
        searchRecord[this.dataMapping.c_search.service_short_description],
      organization_description:
        searchRecord[this.dataMapping.c_search.organization_description],
      organization_short_description:
        searchRecord[this.dataMapping.c_search.organization_short_description],
      website: searchRecord[this.dataMapping.c_search.website],
      phone: searchRecord[this.dataMapping.c_search.phone],
      service_area: searchRecord[this.dataMapping.c_search.service_area],
      taxonomy_terms: searchRecord[this.dataMapping.c_search.taxonomy_terms],
      taxonomy_codes: searchRecord[this.dataMapping.c_search.taxonomy_codes],
      organization_name:
        searchRecord[this.dataMapping.c_search.organization_name],
      location_name: searchRecord[this.dataMapping.c_search.location_name],
      latitude: searchRecord[this.dataMapping.c_search.latitude],
      longitude: searchRecord[this.dataMapping.c_search.longitude],
      physical_address:
        searchRecord[this.dataMapping.c_search.physical_address],
      physical_address_city:
        searchRecord[this.dataMapping.c_search.physical_address_city],
      physical_address_state:
        searchRecord[this.dataMapping.c_search.physical_address_state],
      physical_address_postal_code:
        searchRecord[this.dataMapping.c_search.physical_address_postal_code],
      physical_address_region:
        searchRecord[this.dataMapping.c_search.physical_address_region],
      physical_address_country:
        searchRecord[this.dataMapping.c_search.physical_address_country],
      language: searchRecord[this.dataMapping.c_search.language],
      focus_population:
        searchRecord[this.dataMapping.c_search.focus_population],
      payment_accepted:
        searchRecord[this.dataMapping.c_search.payment_accepted],
      age_group: searchRecord[this.dataMapping.c_search.age_group],
      locale: searchRecord[this.dataMapping.c_search.locale],
      tenant_id: this.config.tenantId,
      is_canonical: true,
    });

    await searchModel.cacheRecord(
      this.caches.models,
      this.caches.invalidRecords
    );
  }

  try {
    await this.caches.invalidRecords.createCSV();
  } catch (err) {
    this.logger.error(err);
  }

  /***************************************************************************
   * This part of the process compares our virtual records to what is in SQL
   * and makes updates for all records that have been changed
   ***************************************************************************/
  const virtualRecordNames = [
    "taxonomy_term_translations",
    "organization_translations",
    "program_translations",
    "service_translations",
    "location_translations",
    "physical_address",
    "postal_address",
    "contact_translations",
    "eligibility_translations",
    "language",
    "payment_accepted_translations",
    "phone_translations",
    "required_document_translations",
    "schedule_translations",
    "service_area_translations",
    "service_at_location_translations",
    "service_attribute",
    "c_search_translations",
  ];

  for (const name of virtualRecordNames) {
    try {
      // @ts-expect-error
      await checkAndAdd.bind(this, name)();
    } catch (err) {
      this.logger.error(err);
    }
  }

  /***************************************************************************
   * This part of the process deletes records that no longer exist from our database
   ***************************************************************************
   ***************************************************************************/
  this.logger.debug("Deleting old records");

  const tableNames = [
    "taxonomy_term_translations",
    "organization_translations",
    "program_translations",
    "service_translations",
    "location_translations",
    "physical_address",
    "postal_address",
    "contact_translations",
    "eligibility_translations",
    "language",
    "payment_accepted_translations",
    "phone_translations",
    "required_document_translations",
    "schedule_translations",
    "service_area_translations",
    "service_at_location_translations",
    "c_search_translations",
  ];

  for (const name of tableNames) {
    try {
      // @ts-expect-error
      await deleteRecordsUtil.bind(this, name)();
    } catch (err) {
      this.logger.error(err);
    }
  }

  this.logger.debug("Done deleting old records");
}
