class CreateProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :projects do |t|
      t.references :workspace_id, null: false, foreign_key: true
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
