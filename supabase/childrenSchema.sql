create table public.children (
  id uuid not null default gen_random_uuid (),
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  gender text not null,
  school_stage text null,
  description text null,
  parent_id uuid not null,
  family_id uuid not null,
  created_by uuid not null default auth.uid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint children_pkey primary key (id),
  constraint children_parent_id_fkey foreign KEY (parent_id) references individuals (id) on delete CASCADE,
  constraint children_family_id_fkey foreign KEY (family_id) references families (id) on delete CASCADE,
  constraint children_last_name_check check ((length(last_name) >= 1)),
  constraint children_date_of_birth_check check ((date_of_birth <= CURRENT_DATE)),
  constraint children_school_stage_check check (
    (
      school_stage = any (
        array[
          'kindergarten'::text,
          'primary'::text,
          'preparatory'::text,
          'secondary'::text
        ]
      )
    )
  ),
  constraint children_first_name_check check ((length(first_name) >= 1)),
  constraint children_gender_check check ((gender = any (array['boy'::text, 'girl'::text])))
) TABLESPACE pg_default;

create index IF not exists idx_children_parent on public.children using btree (parent_id) TABLESPACE pg_default;

create index IF not exists idx_children_family on public.children using btree (family_id) TABLESPACE pg_default;

create index IF not exists idx_children_names on public.children using btree (first_name, last_name) TABLESPACE pg_default;

create trigger ensure_child_age BEFORE INSERT
or
update on children for EACH row
execute FUNCTION check_child_age ();

create trigger update_children_updated_at BEFORE
update on children for EACH row
execute FUNCTION update_updated_at_column ();
