import React  from 'react'
import Link from 'next/link'

type CurrentUser = {
    currentUser: {
        id: string
        email: string
    }
}

const Header: React.FC<CurrentUser> = ({ currentUser }) => {
    const links = [
        !currentUser && { label: 'Sign Up', href: '/auth/signup' },
        !currentUser && { label: 'Sign In', href: '/auth/signin' },
        currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
        currentUser && { label: 'My Orders', href: '/orders' },
        currentUser && { label: 'Sign Out', href: '/auth/signout' },
    ]
    .filter(Boolean)
    .map(({ label, href }) => {
        return (
            <li key={href}>
                <Link href={href} className='navbar-brand'>
                    {label}
                </Link>
            </li>
        )
    })

    return (
        <nav className='navbar navbar-light bg-light'>
            <Link className='navbar-brand' href='/'>
                GitTix
            </Link>

            <div className='d-flex justify-content end'>
                <ul className='nav d-flex align-items-center'>
                    {links}
                </ul>
            </div>
        </nav>
    )
}

export default Header