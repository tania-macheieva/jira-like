# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_23_120500) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "comments", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.bigint "issue_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["issue_id"], name: "index_comments_on_issue_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "epics", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.bigint "workspace_id", null: false
    t.index ["workspace_id"], name: "index_epics_on_workspace_id"
  end

  create_table "issues", force: :cascade do |t|
    t.bigint "assignee_id"
    t.datetime "created_at", null: false
    t.bigint "creator_id", null: false
    t.text "description"
    t.bigint "epic_id"
    t.integer "issue_type", default: 0, null: false
    t.bigint "sprint_id"
    t.integer "status", default: 0, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "workspace_id", null: false
    t.index ["assignee_id"], name: "index_issues_on_assignee_id"
    t.index ["creator_id"], name: "index_issues_on_creator_id"
    t.index ["epic_id"], name: "index_issues_on_epic_id"
    t.index ["sprint_id"], name: "index_issues_on_sprint_id"
    t.index ["workspace_id"], name: "index_issues_on_workspace_id"
  end

  create_table "sprints", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "workspace_id", null: false
    t.index ["workspace_id"], name: "index_sprints_on_workspace_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["name"], name: "index_users_on_name"
  end

  create_table "workspace_memberships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "role", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.bigint "workspace_id", null: false
    t.index ["user_id", "workspace_id"], name: "index_workspace_memberships_on_user_id_and_workspace_id", unique: true
    t.index ["user_id"], name: "index_workspace_memberships_on_user_id"
    t.index ["workspace_id"], name: "index_workspace_memberships_on_workspace_id"
  end

  create_table "workspaces", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "key", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_workspaces_on_key", unique: true
  end

  add_foreign_key "comments", "issues"
  add_foreign_key "comments", "users"
  add_foreign_key "epics", "workspaces"
  add_foreign_key "issues", "epics"
  add_foreign_key "issues", "sprints"
  add_foreign_key "issues", "users", column: "assignee_id"
  add_foreign_key "issues", "users", column: "creator_id"
  add_foreign_key "issues", "workspaces"
  add_foreign_key "sprints", "workspaces"
  add_foreign_key "workspace_memberships", "users"
  add_foreign_key "workspace_memberships", "workspaces"
end
