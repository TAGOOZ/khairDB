create table public.individuals (
  id uuid not null default extensions.uuid_generate_v4 (),
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  gender text not null,
  phone text null,
  district text not null,
  family_id uuid null,
  description text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  address text null,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  job text null,
  employment_status text not null default 'no_salary'::text,
  salary numeric(10, 2) null,
  created_by uuid null,
  marital_status text not null default 'single'::text,
  id_number text not null default '00000000000000'::text,
  status text not null default 'green'::text,
  list_status text not null default 'whitelist'::text,
  additional_members jsonb null default '[]'::jsonb,
  constraint individuals_pkey primary key (id),
  constraint individuals_id_number_unique unique (id_number),
  constraint individuals_created_by_fkey foreign KEY (created_by) references users (id) on delete set null,
  constraint individuals_gender_check check (
    (
      gender = any (array['male'::text, 'female'::text])
    )
  ),
  constraint individuals_id_number_check check ((id_number ~ '^[0-9]{14}$'::text)),
  constraint individuals_list_status_check check (
    (
      list_status = any (
        array[
          'whitelist'::text,
          'blacklist'::text,
          'waitinglist'::text
        ]
      )
    )
  ),
  constraint individuals_marital_status_check check (
    (
      marital_status = any (
        array['single'::text, 'married'::text, 'widowed'::text]
      )
    )
  ),
  constraint individuals_phone_check check (
    (
      (phone is null)
      or (phone ~ '^\+?[0-9][0-9\s\-\(\)]*$'::text)
    )
  ),
  constraint individuals_check check (
    (
      (
        (employment_status = 'has_salary'::text)
        and (salary is not null)
        and (salary >= (0)::numeric)
      )
      or (
        (employment_status <> 'has_salary'::text)
        and (salary is null)
      )
    )
  ),
  constraint individuals_status_check check (
    (
      status = any (array['green'::text, 'yellow'::text, 'red'::text])
    )
  ),
  constraint individuals_district_check check (
    (
      district = any (
        array[
          'الكنيسة'::text,
          'عمارة المعلمين'::text,
          'المرور'::text,
          'المنشية'::text,
          'الرشيدية'::text,
          'شارع الثورة'::text,
          'الزهور'::text,
          'أبو خليل'::text,
          'الكوادي'::text,
          'القطعة'::text,
          'كفر امليط'::text,
          'الشيخ زايد'::text,
          'السببل'::text,
          'قري'::text
        ]
      )
    )
  ),
  constraint individuals_employment_status_check check (
    (
      employment_status = any (
        array[
          'no_salary'::text,
          'has_salary'::text,
          'social_support'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_individuals_created_by on public.individuals using btree (created_by) TABLESPACE pg_default;

create index IF not exists idx_individuals_district on public.individuals using btree (district) TABLESPACE pg_default;

create index IF not exists idx_individuals_family on public.individuals using btree (family_id) TABLESPACE pg_default;

create index IF not exists idx_individuals_family_id on public.individuals using btree (family_id) TABLESPACE pg_default;

create index IF not exists idx_individuals_list_status on public.individuals using btree (list_status) TABLESPACE pg_default;

create index IF not exists idx_individuals_names on public.individuals using btree (first_name, last_name) TABLESPACE pg_default;

create index IF not exists idx_individuals_status on public.individuals using btree (status) TABLESPACE pg_default;

create index IF not exists idx_individuals_additional_members on public.individuals using gin (additional_members) TABLESPACE pg_default;

create trigger delete_needs_on_individual_delete BEFORE DELETE on individuals for EACH row
execute FUNCTION delete_needs_on_individual_delete ();

create trigger update_individuals_updated_at BEFORE
update on individuals for EACH row
execute FUNCTION update_updated_at_column ();

create trigger validate_individual_data_trigger BEFORE INSERT
or
update on individuals for EACH row
execute FUNCTION validate_individual_data ();
