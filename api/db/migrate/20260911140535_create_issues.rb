class CreateIssues < ActiveRecord::Migration[8.1]
  def change
    create_table :issues do |t|
      t.references :workspace, null: false, foreign_key: true
      t.references :epic, foreign_key: true
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.references :assignee, foreign_key: { to_table: :users }

      t.string :title, null: false
      t.text :description
      t.integer :status, null: false, default: 0
      t.integer :issue_type, null: false, default: 0

      t.timestamps
    end
  end
end