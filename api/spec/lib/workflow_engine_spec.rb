# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkflowEngine do
  subject(:engine) { described_class.new }

  describe '#allowed?' do
    it 'allows the configured forward transitions' do
      expect(engine.allowed?(:to_do, :in_progress)).to be(true)
      expect(engine.allowed?(:in_progress, :review)).to be(true)
      expect(engine.allowed?(:review, :qa)).to be(true)
      expect(engine.allowed?(:qa, :done)).to be(true)
      expect(engine.allowed?(:qa, :in_progress)).to be(true)
    end

    it 'rejects transitions that are not configured' do
      expect(engine.allowed?(:to_do, :done)).to be(false)
      expect(engine.allowed?(:review, :done)).to be(false)
    end

    it 'allows keeping the current status' do
      expect(engine.allowed?('qa', :qa)).to be(true)
    end
  end

  describe '#transition!' do
    it 'raises a descriptive error for an invalid transition' do
      expect { engine.transition!(:review, :done) }
        .to raise_error(described_class::InvalidTransitionError, 'Transition from review to done is not allowed')
    end
  end
end
