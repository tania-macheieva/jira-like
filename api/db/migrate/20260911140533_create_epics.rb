# frozen_string_literal: true

class CreateEpics < ActiveRecord::Migration[8.1]
  def change
    create_table :epics do |t|
      t.references :workspace, null: false, foreign_key: true

      t.string :name, null: false
      t.text :description

      t.timestamps
    end
  end
end
