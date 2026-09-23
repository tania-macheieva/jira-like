# frozen_string_literal: true

class AddSprintToIssues < ActiveRecord::Migration[8.1]
  def change
    add_reference :issues, :sprint, foreign_key: true
  end
end
