# frozen_string_literal: true

class CreateWorkspaces < ActiveRecord::Migration[8.1]
  def change
    create_table :workspaces do |t|
      t.string :name, null: false
      t.string :key, null: false

      t.timestamps
    end

    add_index :workspaces, :key, unique: true
  end
end
