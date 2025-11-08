-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('SUPERADMIN', 'GROUP_ADMIN', 'UNIT_ADMIN', 'LEADER', 'HELPER', 'GUARDIAN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ScoutBranch" AS ENUM ('CUBS', 'SWALLOWS', 'MIXED_PACK', 'MIXED_FLOCK', 'SCOUTS', 'GUIDES', 'MIXED_TROOP', 'VENTURERS', 'ROVERS', 'MIXED_VENTURE_UNIT', 'CLAN', 'LEADERSHIP', 'HELPERS');

-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('MEMBER', 'LEADER', 'GROUP_DIRECTOR', 'HELPER', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "UnitRole" AS ENUM ('LEADER', 'ASSISTANT', 'MEMBER');

-- CreateEnum
CREATE TYPE "AllergySeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MedicalInfoType" AS ENUM ('CHRONIC_CONDITION', 'MEDICATION', 'PHYSICAL_RESTRICTION', 'DISABILITY', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'TRUCK', 'BUS', 'MINIBUS', 'VAN', 'OTHER');

-- CreateEnum
CREATE TYPE "AccommodationType" AS ENUM ('TENT', 'CABIN', 'SHELTER', 'OTHER');

-- CreateEnum
CREATE TYPE "UtensilCategory" AS ENUM ('KITCHEN', 'SCOUT_MATERIAL', 'CAMPING', 'FIRST_AID', 'TOOLS', 'LIGHTING', 'FUEL', 'OTHER');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER');

-- CreateEnum
CREATE TYPE "UtensilStatus" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_MAINTENANCE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BudgetItemType" AS ENUM ('FOOD', 'TRANSPORT', 'ACCOMMODATION', 'OTHER');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "system_role" "SystemRole" NOT NULL DEFAULT 'LEADER',
    "invitation_status" "InvitationStatus",
    "invitation_token" TEXT,
    "invitation_sent_at" TIMESTAMP(3),
    "pending_group_id" INTEGER,
    "pending_system_role" "SystemRole",
    "person_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "scout_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER,
    "district" TEXT,
    "zone" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "group_email" TEXT,
    "is_mixed" BOOLEAN NOT NULL DEFAULT false,
    "foundation_date" DATE,
    "primary_color" DOUBLE PRECISION,
    "secondary_color" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "scout_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "emergency_contact" TEXT,
    "birth_date" DATE,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "branch" "ScoutBranch" NOT NULL,
    "group_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camps" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "fee_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "group_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "camps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_groups" (
    "person_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "group_role" "GroupRole" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "person_groups_pkey" PRIMARY KEY ("person_id","group_id")
);

-- CreateTable
CREATE TABLE "unit_assistants" (
    "unit_id" INTEGER NOT NULL,
    "assistant_id" INTEGER NOT NULL,
    "role" "UnitRole" NOT NULL DEFAULT 'MEMBER',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_assistants_pkey" PRIMARY KEY ("unit_id","assistant_id")
);

-- CreateTable
CREATE TABLE "activity_units" (
    "activity_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_units_pkey" PRIMARY KEY ("activity_id","unit_id")
);

-- CreateTable
CREATE TABLE "person_guardians" (
    "child_id" INTEGER NOT NULL,
    "guardian_id" INTEGER NOT NULL,
    "relationship" TEXT,
    "is_main_contact" BOOLEAN NOT NULL DEFAULT false,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "person_guardians_pkey" PRIMARY KEY ("child_id","guardian_id")
);

-- CreateTable
CREATE TABLE "participations" (
    "person_id" INTEGER NOT NULL,
    "camp_id" INTEGER NOT NULL,
    "payment_made" BOOLEAN NOT NULL DEFAULT false,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_camp_director" BOOLEAN NOT NULL DEFAULT false,
    "is_emergency_driver" BOOLEAN NOT NULL DEFAULT false,
    "has_first_aid_kit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "participations_pkey" PRIMARY KEY ("person_id","camp_id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "severity" "AllergySeverity",
    "observations" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_info" (
    "id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "type" "MedicalInfoType" NOT NULL,
    "description" TEXT NOT NULL,
    "medications" TEXT,
    "restrictions" TEXT,
    "observations" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "medical_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit_of_measure" TEXT NOT NULL DEFAULT 'kg',
    "common_allergens" TEXT,
    "is_common_allergen" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "observations" TEXT,
    "group_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "meal_type" "MealType",
    "base_servings" INTEGER NOT NULL DEFAULT 4,
    "instructions" TEXT,
    "preparation_time_min" INTEGER,
    "difficulty" TEXT,
    "present_allergens" TEXT,
    "group_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_ingredients" (
    "id" SERIAL NOT NULL,
    "dish_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "unit" TEXT NOT NULL,
    "observations" TEXT,

    CONSTRAINT "dish_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camp_menus" (
    "id" SERIAL NOT NULL,
    "camp_id" INTEGER NOT NULL,
    "dish_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "estimated_time" TEXT,
    "number_of_servings" INTEGER NOT NULL DEFAULT 1,
    "observations" TEXT,
    "activity_id" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "camp_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utensils" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "UtensilCategory" NOT NULL,
    "description" TEXT,
    "available_quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_of_measure" TEXT,
    "status" "UtensilStatus",
    "location" TEXT,
    "acquisition_date" DATE,
    "observations" TEXT,
    "group_id" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "utensils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_utensils" (
    "id" SERIAL NOT NULL,
    "dish_id" INTEGER NOT NULL,
    "utensil_id" INTEGER NOT NULL,
    "quantity_needed" INTEGER NOT NULL DEFAULT 1,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "observations" TEXT,

    CONSTRAINT "dish_utensils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transports" (
    "id" SERIAL NOT NULL,
    "camp_id" INTEGER NOT NULL,
    "type" "VehicleType" NOT NULL,
    "name" TEXT NOT NULL,
    "passenger_capacity" INTEGER NOT NULL,
    "license_plate" TEXT,
    "driver_name" TEXT,
    "driver_phone" TEXT,
    "driver_email" TEXT,
    "departure_time" TEXT,
    "departure_location" TEXT,
    "arrival_time" TEXT,
    "arrival_location" TEXT,
    "observations" TEXT,
    "cost" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "transports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_assignments" (
    "id" SERIAL NOT NULL,
    "participation_person_id" INTEGER NOT NULL,
    "participation_camp_id" INTEGER NOT NULL,
    "transport_id" INTEGER NOT NULL,
    "seat_order" INTEGER,
    "observations" TEXT,

    CONSTRAINT "transport_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodations" (
    "id" SERIAL NOT NULL,
    "camp_id" INTEGER NOT NULL,
    "type" "AccommodationType" NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "leader_responsible_id" INTEGER,
    "observations" TEXT,
    "cost" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_assignments" (
    "id" SERIAL NOT NULL,
    "participation_person_id" INTEGER NOT NULL,
    "participation_camp_id" INTEGER NOT NULL,
    "accommodation_id" INTEGER NOT NULL,
    "check_in_date" DATE,
    "check_out_date" DATE,
    "observations" TEXT,

    CONSTRAINT "accommodation_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "camp_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "date" DATE NOT NULL,
    "start_time" TEXT,
    "duration_minutes" INTEGER,
    "end_time" TEXT,
    "location" TEXT,
    "leader_responsible_id" INTEGER,
    "materials_needed" TEXT,
    "difficulty" TEXT,
    "recommended_weather" TEXT,
    "observations" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contact_person" TEXT,
    "description" TEXT,
    "observations" TEXT,
    "group_id" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_prices" (
    "id" SERIAL NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "update_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_current_price" BOOLEAN NOT NULL DEFAULT true,
    "observations" TEXT,

    CONSTRAINT "ingredient_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" SERIAL NOT NULL,
    "camp_id" INTEGER NOT NULL,
    "name" TEXT,
    "estimated_food_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "estimated_transport_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "estimated_accommodation_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "estimated_other_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_food_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_transport_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_accommodation_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_other_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "estimated_total" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_total" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "observations" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" SERIAL NOT NULL,
    "budget_id" INTEGER NOT NULL,
    "type" "BudgetItemType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "actual_total_price" DOUBLE PRECISION,
    "ingredient_id" INTEGER,
    "provider_id" INTEGER,
    "transport_id" INTEGER,
    "accommodation_id" INTEGER,
    "observations" TEXT,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "camp_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "due_date" DATE,
    "completed_at" DATE,
    "assigned_to_person_id" INTEGER,
    "notes_on_completion" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" SERIAL NOT NULL,
    "camp_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "relationship" TEXT,
    "phone" TEXT NOT NULL,
    "alternative_phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "location" TEXT,
    "office_hours" TEXT,
    "specialty" TEXT,
    "observations" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_invitation_token_key" ON "users"("invitation_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_person_id_key" ON "users"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "scout_groups_name_key" ON "scout_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_group_id_key" ON "ingredients"("name", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "dishes_name_group_id_key" ON "dishes"("name", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_camp_id_key" ON "budgets"("camp_id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scout_groups" ADD CONSTRAINT "scout_groups_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scout_groups" ADD CONSTRAINT "scout_groups_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scout_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camps" ADD CONSTRAINT "camps_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camps" ADD CONSTRAINT "camps_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camps" ADD CONSTRAINT "camps_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scout_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_groups" ADD CONSTRAINT "person_groups_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_groups" ADD CONSTRAINT "person_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scout_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_assistants" ADD CONSTRAINT "unit_assistants_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_assistants" ADD CONSTRAINT "unit_assistants_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_units" ADD CONSTRAINT "activity_units_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_units" ADD CONSTRAINT "activity_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_guardians" ADD CONSTRAINT "person_guardians_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_guardians" ADD CONSTRAINT "person_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_info" ADD CONSTRAINT "medical_info_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_info" ADD CONSTRAINT "medical_info_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_info" ADD CONSTRAINT "medical_info_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scout_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scout_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_menus" ADD CONSTRAINT "camp_menus_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_menus" ADD CONSTRAINT "camp_menus_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_menus" ADD CONSTRAINT "camp_menus_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_menus" ADD CONSTRAINT "camp_menus_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_menus" ADD CONSTRAINT "camp_menus_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utensils" ADD CONSTRAINT "utensils_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utensils" ADD CONSTRAINT "utensils_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utensils" ADD CONSTRAINT "utensils_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scout_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_utensils" ADD CONSTRAINT "dish_utensils_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_utensils" ADD CONSTRAINT "dish_utensils_utensil_id_fkey" FOREIGN KEY ("utensil_id") REFERENCES "utensils"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transports" ADD CONSTRAINT "transports_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transports" ADD CONSTRAINT "transports_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transports" ADD CONSTRAINT "transports_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_assignments" ADD CONSTRAINT "transport_assignments_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_assignments" ADD CONSTRAINT "transport_assignments_participation_person_id_participatio_fkey" FOREIGN KEY ("participation_person_id", "participation_camp_id") REFERENCES "participations"("person_id", "camp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_leader_responsible_id_fkey" FOREIGN KEY ("leader_responsible_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_assignments" ADD CONSTRAINT "accommodation_assignments_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_assignments" ADD CONSTRAINT "accommodation_assignments_participation_person_id_particip_fkey" FOREIGN KEY ("participation_person_id", "participation_camp_id") REFERENCES "participations"("person_id", "camp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_leader_responsible_id_fkey" FOREIGN KEY ("leader_responsible_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scout_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_prices" ADD CONSTRAINT "ingredient_prices_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_prices" ADD CONSTRAINT "ingredient_prices_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_person_id_fkey" FOREIGN KEY ("assigned_to_person_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
