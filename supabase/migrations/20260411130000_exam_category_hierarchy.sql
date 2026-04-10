-- Enable hierarchical (parent/sub) categories and optional subcategory filter for exam batches

-- 1) exam_categories: add parent_id for nesting
alter table if exists public.exam_categories
  add column if not exists parent_id uuid null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exam_categories'
      and column_name = 'parent_id'
  ) then
    begin
      alter table public.exam_categories
        add constraint exam_categories_parent_id_fkey
        foreign key (parent_id) references public.exam_categories(id)
        on delete cascade;
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;

create index if not exists exam_categories_parent_id_idx
  on public.exam_categories(parent_id);

-- 2) exam_batches: optional subcategory_id for extra filtering
alter table if exists public.exam_batches
  add column if not exists subcategory_id uuid null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exam_batches'
      and column_name = 'subcategory_id'
  ) then
    begin
      alter table public.exam_batches
        add constraint exam_batches_subcategory_id_fkey
        foreign key (subcategory_id) references public.exam_categories(id)
        on delete set null;
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;

create index if not exists exam_batches_subcategory_id_idx
  on public.exam_batches(subcategory_id);
