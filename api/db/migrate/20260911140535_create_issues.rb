class CreateIssues < ActiveRecord::Migration[8.1]
  def change 
    create_enum :issue_type, {}

    create_table :issues do |t|
      t.references :project_id, null: false, foreign_key: true
      t.string :name
      t.text :description
      t.integer :issue_type
      t.integer :issue_status

      t.timestamps
    end
  end
end
