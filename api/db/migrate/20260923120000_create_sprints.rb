# frozen_string_literal: true

class CreateSprints < ActiveRecord::Migration[8.1]
  def change
    create_table :sprints do |t|
      t.references :workspace, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :status, null: false, default: 0

      t.timestamps
    end
  end
end
