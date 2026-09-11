class CreateWorkspaceMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :workspace_memberships do |t|
      t.references :user_id, null: false, foreign_key: true
      t.references :workspace_id, null: false, foreign_key: true
      t.integer :role

      t.timestamps
    end
  end
end
