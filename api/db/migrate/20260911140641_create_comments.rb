class CreateComments < ActiveRecord::Migration[8.1]
  def change
    create_table :comments do |t|
      t.references :issue_id, null: false, foreign_key: true
      t.references :user_id, null: false, foreign_key: true
      t.text :body

      t.timestamps
    end
  end
end
