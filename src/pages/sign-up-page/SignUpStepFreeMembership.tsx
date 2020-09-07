import React, { useEffect } from "react";
import { injectStripe } from "react-stripe-elements";
import SignUpStepperButton from "./SignUpStepperButton";
import "./Stripe.scss";
import * as PropTypes from "prop-types";
import LoggedInState from "../../components/HOC/LoggedInState";
import { ROOT } from "../../urls";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";
import UpdateUserData from "../../components/HOC/UpdateUserData";
import { animateScroll } from "react-scroll";
import { compose } from "underscore";
import { IRedisState } from "../../entities/User";
import { IUpdateUserData } from "../../reducers/currentUser";

interface Props extends RouteComponentProps {
  firebaseUser: firebase.User
  isLast: boolean
  onNextClicked: () => void
  youngerThan13: boolean
  membershipExpiresAt?: string
  updateUserData: IUpdateUserData
}

function SignUpStepPayment({ history }: Props) {
  useEffect(() => {
    animateScroll.scrollToTop({ duration: 0 });
  }, []);

  const getBody = () => {
    return (
      <div className="text-success text-center mt-4">
        <h3>
          <p className='bold'>Due to COVID-19, all membership fees are waived until summer 2021</p>
        </h3>
        <h5>
          <p>
            If for any reason you do not want to be a member of the club, please let us know by sending an email to <a
            href='mailto://info@belmontrunners.com' target='_blank'
            rel='noreferrer noopener'>info@belmontrunners.com</a>.
          </p>
        </h5>
      </div>
    );
  };

  console.log("SignUpStepPayment.render() called.");

  const handleClose = () => {
    history.push(ROOT);
  };

  return (
    <div className="justify-content-center">
      {getBody()}

      <h5 className="mt-5">Benefits to being part of Belmont Runners</h5>

      &bull; Training at group runs and walks
      <br />
      &bull; Free or discounted workshops, clinics, and classes
      <br />
      &bull; Discounted entry to the Belmont Water Dog Run
      <br />
      &bull; Discounted entry to other local races
      <br />
      &bull; Membership with the Road Runners Club of America
      <br />
      &bull; Liability insurance coverage
      <br />
      &bull; Discounts at local restaurants
      <br />
      &bull; Social events with fun, active local runners and walkers
      <br />
      &bull; 10% discount at{" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://arunnersmind.com"
      >
        A Runner’s Mind
      </a>
      <br />

      {
        <SignUpStepperButton
          handlePrimaryClicked={handleClose}
          primaryText={"Finish"}
          primaryDisabled={false}
          showPrimary
          showSecondary={false}
        />
      }

    </div>
  );
}

SignUpStepPayment.propTypes = {
  // from redux
  firebaseUser: PropTypes.object.isRequired,
  updateUserData: PropTypes.func.isRequired,
  needToPay: PropTypes.bool,
  membershipExpiresAt: PropTypes.string,
  totalAmount: PropTypes.number.isRequired,
  youngerThan13: PropTypes.bool.isRequired,

  // from parent
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired,

  // from router-dom
  history: PropTypes.object.isRequired
};

const mapStateToProps = ({ currentUser: { firebaseUser } }: IRedisState) => {
  return {
    firebaseUser
  };
};

export default compose(
  UpdateUserData,
  withRouter,
  injectStripe,
  LoggedInState(),
  connect(mapStateToProps)
)(SignUpStepPayment);
