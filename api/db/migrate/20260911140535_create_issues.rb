class CreateIssues < ActiveRecord::Migration[8.1]
  def change 
    create_enum :status, 
                { todo: 0, in_progress: 1, review: 2, qa: 3, done: 4 }
    create_enum :issue_type,
                { task: 0, bug: 1, story: 2, feature: 3 }

    create_table :issues do |t|
      t.references :project_id, null: false, foreign_key: true
      t.references :creator, null: false, foreign_key: true
      t.references :assignee, foreign_key: true

      t.string :title, null: false
      t.text :description
      t.integer :status, enum_type: 'issue_status', null: false, default: '0'
      t.integer :issue_type, enum_type: 'issue_type', null: false, default: '0'

      t.timestamps
    end
  end
end
