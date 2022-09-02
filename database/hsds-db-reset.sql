DO $$ DECLARE
    r RECORD;
BEGIN
    -- if the schema you operate on is not "current", you will want to
    -- replace current_schema() in query with 'schematodeletetablesfrom'
    -- *and* update the generate 'DROP...' accordingly.
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

--create types
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'location_type') THEN
        CREATE TYPE location_type AS ENUM
        (
            'physical',
            'postal',
            'virtual'
        );
    END IF;
    --more types here...
END$$;

CREATE TABLE organization (
  id VARCHAR (255) PRIMARY KEY,
  name VARCHAR (255) NOT NULL,
  alternate_name VARCHAR (255),
  description TEXT NOT NULL,
  email VARCHAR (255),
  url VARCHAR (255),
  year_incorporated VARCHAR (255),
  legal_status VARCHAR (255),
  logo VARCHAR (255),
  uri VARCHAR (255),
  parent_organization VARCHAR (255),

  FOREIGN KEY (parent_organization)
    REFERENCES organization (id)
);

CREATE TABLE program (
  id VARCHAR (255) PRIMARY KEY,
  organization_id VARCHAR (255) NOT NULL,
  name VARCHAR (255) NOT NULL,
  alternate_name VARCHAR (255),
  description TEXT NOT NULL,

  FOREIGN KEY (organization_id)
    REFERENCES organization (id)
);

CREATE TABLE service (
  id VARCHAR(255) PRIMARY KEY,
  organization_id VARCHAR (255) NOT NULL,
  program_id VARCHAR (255),
  name VARCHAR (255) NOT NULL,
  alternate_name VARCHAR (255),
  description TEXT,
  url VARCHAR (255),
  email VARCHAR (255),
  status VARCHAR (255) NOT NULL,
  interpretation_services TEXT,
  application_process TEXT,
  accreditations TEXT,
  licenses VARCHAR (255),
  eligibility_description TEXT,
  minimum_age INT NOT NULL,
  maximum_age INT NOT NULL,
  assured_date DATE,
  assurer_email VARCHAR (255),

  FOREIGN KEY (organization_id)
    REFERENCES organization (id),
  FOREIGN KEY (program_id)
    REFERENCES program (id)
);

CREATE TABLE location (
  id VARCHAR (255) PRIMARY KEY,
  location_type location_type NOT NULL,
  url VARCHAR (255),
  organization_id VARCHAR (255),
  name VARCHAR (255),
  alternate_name VARCHAR (255),
  description TEXT,
  transportation TEXT,
  latitude VARCHAR (255),
  longitude VARCHAR (255),
  external_identifier VARCHAR (255),
  external_identifier_type VARCHAR (255),

  FOREIGN KEY (organization_id)
    REFERENCES organization (id)
);

CREATE TABLE attribute (
  id VARCHAR (255) PRIMARY KEY,
  service_id VARCHAR (255) NOT NULL,
  taxonomy_term VARCHAR (255),
  link_type VARCHAR (255) NOT NULL,
  value VARCHAR (255),

  FOREIGN KEY (service_id)
    REFERENCES service (id)
);

CREATE TABLE service_at_location (
  id VARCHAR (255) PRIMARY KEY,
  service_id VARCHAR (255) NOT NULL,
  location_id VARCHAR (255) NOT NULL,
  description TEXT,

  FOREIGN KEY (service_id)
    REFERENCES service (id),
  FOREIGN KEY (location_id)
    REFERENCES location (id)
);

CREATE TABLE contact (
  id VARCHAR (255) PRIMARY KEY,
  organization_id VARCHAR (255),
  service_id VARCHAR (255),
  service_at_location_id VARCHAR (255),
  location_id VARCHAR (255),
  name VARCHAR (255),
  title VARCHAR (255),
  department VARCHAR (255),
  email VARCHAR (255),

  FOREIGN KEY (organization_id)
    REFERENCES organization (id),
  FOREIGN KEY (service_id)
    REFERENCES service (id),
  FOREIGN KEY (service_at_location_id)
    REFERENCES service_at_location (id),
  FOREIGN KEY (location_id)
    REFERENCES location (id)
);

CREATE TABLE phone (
  id VARCHAR (255) PRIMARY KEY,
  location_id VARCHAR (255),
  service_id VARCHAR (255),
  organization_id VARCHAR (255),
  contact_id VARCHAR (255),
  service_at_location_id VARCHAR (255),
  number VARCHAR (255) NOT NULL,
  extension INT,
  type VARCHAR (255),
  language VARCHAR (255),
  description TEXT,

  FOREIGN KEY (location_id)
    REFERENCES location (id),
  FOREIGN KEY (service_id)
    REFERENCES service (id),
  FOREIGN KEY (organization_id)
    REFERENCES organization (id),
  FOREIGN KEY (contact_id)
    REFERENCES contact (id),
  FOREIGN KEY (service_at_location_id)
    REFERENCES service_at_location (id)
);

CREATE TABLE address (
  id VARCHAR (255) PRIMARY KEY,
  location_id VARCHAR (255),
  attention VARCHAR (255),
  address_1 VARCHAR (255) NOT NULL,
  city VARCHAR (255) NOT NULL,
  region VARCHAR (255),
  state_province VARCHAR (255) NOT NULL,
  postal_code VARCHAR (255) NOT NULL,
  country VARCHAR (255) NOT NULL,
  address_type VARCHAR (255) NOT NULL,

  FOREIGN KEY (location_id)
    REFERENCES location (id)
);

CREATE TABLE schedule (
  id VARCHAR (255) PRIMARY KEY,
  service_id VARCHAR (255),
  location_id VARCHAR (255),
  service_at_location_id VARCHAR (255),
  valid_from DATE,
  valid_to DATE,
  dtstart DATE,
  timezone INT,
  until DATE,
  count INT,
  wkst DATE,
  freq VARCHAR (255),
  interval INT,
  byday VARCHAR (255),
  byweekno VARCHAR (255),
  bymonthday VARCHAR (255),
  byyearday VARCHAR (255),
  description TEXT,
  opens_at DATE,
  closes_at DATE,
  schedule_link VARCHAR (255),
  attending_type VARCHAR (255),
  notes TEXT,

  FOREIGN KEY (service_id)
    REFERENCES service (id),
  FOREIGN KEY (location_id)
    REFERENCES location (id),
  FOREIGN KEY (service_at_location_id)
    REFERENCES service_at_location (id)
);

CREATE TABLE funding (
  id VARCHAR (255) PRIMARY KEY,
  organization_id VARCHAR (255),
  service_id VARCHAR (255),
  source TEXT,

  FOREIGN KEY (organization_id)
    REFERENCES organization (id),
  FOREIGN KEY (service_id)
    REFERENCES service (id)
);

CREATE TABLE service_area (
  id VARCHAR (255) PRIMARY KEY,
  service_id VARCHAR (255),
  service_area TEXT,
  description TEXT,
  extent TEXT,
  extent_type VARCHAR (255),
  uri VARCHAR (255),

  FOREIGN KEY (service_id)
    REFERENCES service (id)
);

CREATE TABLE required_document (
  id VARCHAR (255) PRIMARY KEY,
  service_id VARCHAR (255),
  document VARCHAR (255),

  FOREIGN KEY (service_id)
    REFERENCES service (id)
);

CREATE TABLE language (
  id VARCHAR (255) PRIMARY KEY,
  service_id VARCHAR (255),
  location_id VARCHAR (255),
  language VARCHAR (255),
  code VARCHAR (255),
  note TEXT,

  FOREIGN KEY (service_id)
    REFERENCES service (id),
  FOREIGN KEY (location_id)
    REFERENCES location (id)
);

CREATE TABLE accessibility (
  id VARCHAR (255) PRIMARY KEY,
  location_id VARCHAR (255),
  description TEXT,
  details TEXT,
  url VARCHAR (255),

  FOREIGN KEY (location_id)
    REFERENCES location (id)
);

CREATE TABLE taxonomy_term (
  id VARCHAR (255) PRIMARY KEY,
  code VARCHAR (255),
  name VARCHAR (255) NOT NULL,
  description TEXT NOT NULL,
  parent_id VARCHAR (255),
  taxonomy VARCHAR (255),
  language VARCHAR (255)
);

CREATE TABLE metadata (
  id VARCHAR (255) PRIMARY KEY,
  resource_id VARCHAR (255) NOT NULL,
  resource_type VARCHAR (255) NOT NULL,
  last_action_date DATE NOT NULL,
  last_action_type VARCHAR (255) NOT NULL,
  field_name VARCHAR (255) NOT NULL,
  previous_value TEXT NOT NULL,
  replacement_value TEXT NOT NULL,
  updated_by VARCHAR (255) NOT NULL
);

CREATE TABLE meta_table_description (
  id VARCHAR (255) PRIMARY KEY,
  name VARCHAR (255),
  language VARCHAR (255),
  character_set VARCHAR (255)
);

CREATE TABLE cost_option (
  id VARCHAR (255) PRIMARY KEY,
  service_id VARCHAR (255) NOT NULL,
  valid_from DATE,
  valid_to DATE,
  option TEXT,
  amount DECIMAL (12,2),
  amount_description TEXT,

  FOREIGN KEY (service_id)
    REFERENCES service (id)
);

CREATE TABLE organization_identifier (
  id VARCHAR (255) PRIMARY KEY,
  organization_id VARCHAR (255) NOT NULL,
  identifier_type VARCHAR (255) NOT NULL,
  identifier VARCHAR (255) NOT NULL,

  FOREIGN KEY (organization_id)
    REFERENCES organization (id)
);

CREATE TABLE taxonomy (
  id VARCHAR (255) PRIMARY KEY,
  name VARCHAR (255) NOT NULL,
  description TEXT NOT NULL,
  uri VARCHAR (255),
  version VARCHAR (255)
);

CREATE TABLE reference_information (
  id VARCHAR (255) PRIMARY KEY,
  service_id VARCHAR (255),
  organization_id VARCHAR (255),
  link_type VARCHAR (255),
  url VARCHAR (255),
  description TEXT,

  FOREIGN KEY (service_id)
    REFERENCES service (id),
  FOREIGN KEY (organization_id)
    REFERENCES organization (id)
);